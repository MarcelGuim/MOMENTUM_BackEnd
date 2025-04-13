import { Request, Response } from 'express';
import { LoginRequestBody } from '../../types';
import { AuthService } from './auth.services';

const authService = new AuthService();

export const loginUser = async (req: Request, res: Response) => {
  try {
      const { name_or_mail, password } = req.body as LoginRequestBody;
      const { user, accessToken, refreshToken } = await authService.loginUser(name_or_mail, password);
  
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
  
      console.log('Sending refreshToken in cookie:', refreshToken);
      console.log('Sending accessToken in response:',  accessToken );
  
      return res.status(200).json({
        user,
        accessToken // Store this in localStorage
      });
    } catch (error: any) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }
  };
  
  export const refresh = async (req: Request, res: Response) => {
    try {
      // 1. First check if refreshPayload exists
      if (!req.refreshPayload) {
        console.error('No refresh payload found in request');
        throw new Error('Invalid refresh token');
      }
  
      // 2. Destructure with type safety
      const { userId, modelType } = req.refreshPayload;
      
      console.log('Extracted userId:', userId || 'UNDEFINED');
  
      if (!userId || !modelType) {
        console.error('Invalid token payload - missing required fields');
        throw new Error('Invalid token payload');
      }
  
      const { accessToken } = await authService.refreshTokens(userId, modelType);
      
      console.log('Tokens generated:', {
        accessToken: accessToken ? `${accessToken.substring(0, 10)}...` : 'UNDEFINED',
      });
  
      return res.json({ 
        accessToken,
        debug: process.env.NODE_ENV === 'development' ? {
          userId,
          tokenExpiresIn: '15m' // Match your JWT expiry
        } : undefined
      });
  
    } catch (error: any) {
      console.error('Refresh failed:', {
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : 'HIDDEN IN PRODUCTION',
        timestamp: new Date().toISOString()
      });
  
      return res.status(401).json({ 
        error: error.message || 'Token refresh failed',
        ...(process.env.NODE_ENV === 'development' && {
          details: {
            suggestion: 'Check if user exists and refresh token is valid',
            timestamp: new Date().toISOString()
          }
        })
      });
    }
  };
  
  export const logout = async (req: Request, res: Response) => {
    try {
      res.clearCookie('refreshToken');
      return res.json({ message: 'Logged out successfully' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };