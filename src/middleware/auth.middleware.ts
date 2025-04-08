import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, verifyRefreshToken } from '../utils/jwt.utils';


export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  console.log('--- authenticate middleware triggered ---');
  console.log('Incoming headers:', JSON.stringify(req.headers, null, 2));
  
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // Bearer <token>

  console.log('Extractgited token:', token ? `${token.substring(0, 10)}...` : 'NOT FOUND');

  if (!token) {
    console.error('No token provided in authorization header');
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'MISSING_ACCESS_TOKEN'
    });
  }

  try {
    console.log('Verifying access token...');
    const decoded = verifyAccessToken(token);
    console.log('Token successfully decoded:', {
      userId: decoded.userId,
      iat: decoded.iat,
      exp: decoded.exp
    });
    
    req.user = decoded;
    next();
  } catch (error: any) {
    console.error('Token verification failed:', {
      error: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Access token expired',
        code: 'ACCESS_TOKEN_EXPIRED'
      });
    }
    return res.status(403).json({ 
      error: 'Invalid access token',
      code: 'INVALID_ACCESS_TOKEN'
    });
  }
};

export const verifyRefresh = (req: Request, res: Response, next: NextFunction) => {
  console.log('--- verifyRefresh middleware triggered ---');
  console.log('Incoming cookies:', req.cookies);
  
  const refreshToken = req.cookies.refreshToken;
  console.log('Refresh token from cookies:', refreshToken ? `${refreshToken.substring(0, 10)}...` : 'NOT FOUND');

  if (!refreshToken) {
    console.error('No refresh token found in cookies');
    return res.status(401).json({ 
      error: 'Refresh token required',
      code: 'MISSING_REFRESH_TOKEN'
    });
  }

  try {
    console.log('Verifying refresh token...');
    const decoded = verifyRefreshToken(refreshToken);
    console.log('Refresh token successfully decoded:', {
      userId: decoded.userId,
      iat: decoded.iat,
      exp: decoded.exp
    });
    
    req.user = decoded;
    next();
  } catch (error: any) {
    console.error('Refresh token verification failed:', {
      error: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    return res.status(403).json({ 
      error: 'Invalid refresh token',
      code: 'INVALID_REFRESH_TOKEN'
    });
  }
};