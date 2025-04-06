import jwt from 'jsonwebtoken';
import { IUsuari } from '../models/users/user.model';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret_123';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_123';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface TokenPayload {
    userId: string;
    email?: string;
    iat?: number;
    exp?: number;
  }

export const generateAccessToken = (user: IUsuari): string => {
  const payload: TokenPayload = {
    userId: user._id!.toString(),
    email: user.mail
  };
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

export const generateRefreshToken = (user: IUsuari): string => {
  const payload: TokenPayload = {
    userId: user._id!.toString()
  };
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
};