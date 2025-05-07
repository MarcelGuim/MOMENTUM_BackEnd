import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, verifyRefreshToken } from '../utils/jwt.utils';
import { UserRole } from '../types';
import { AccessTokenPayload } from '../utils/jwt.utils';

// MIDDLEWARES TO CHECK AUTHENTICATION
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // Bearer <token>
  if (!token) {
    console.error('No token provided in authorization header');
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'MISSING_ACCESS_TOKEN'
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    console.log('Token successfully decoded:', {
      userId: decoded.userId,
    });
    req.userPayload = decoded;
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
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    console.error('No refresh token found in cookies');
    return res.status(401).json({ 
      error: 'Refresh token required',
      code: 'MISSING_REFRESH_TOKEN'
    });
  }
  try {
    const decoded = verifyRefreshToken(refreshToken);
    console.log('Refresh token successfully decoded:', {
      userId: decoded.userId,
    });
    req.refreshPayload = decoded;
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

//MIDDLEWARES TO CHECK PERMISONS
export const requireRole = (requiredRole: UserRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const payload = req.userPayload as AccessTokenPayload;
    
    if (!payload) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    if (!payload.role || payload.role !== requiredRole) {
      return res.status(403).json({ 
        error: `Insufficient permissions. Required role: ${requiredRole}`,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

// Specific role middlewares for convenience
export const requireAdmin = requireRole(UserRole.ADMIN);
export const requireController = requireRole(UserRole.CONTROLLER);
export const requireEmployee = requireRole(UserRole.EMPLOYEE);

export const requireAnyRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const payload = req.userPayload as AccessTokenPayload;

    if (!payload?.role) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    if (!allowedRoles.includes(payload.role)) {
      return res.status(403).json({ 
        error: `Insufficient permissions. Required one of: ${allowedRoles.join(', ')}`,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};


export const requireOwnership = (userIdParamName = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const payload = req.userPayload as AccessTokenPayload;
    const requestedUserId = req.params[userIdParamName];

    if (!payload) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    if (payload.userId !== requestedUserId) {
      return res.status(403).json({ 
        error: 'You can only access your own data',
        code: 'ACCESS_TO_OTHER_USER_DENIED'
      });
    }

    next();
  };
};


