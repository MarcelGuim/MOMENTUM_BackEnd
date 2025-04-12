import jwt from 'jsonwebtoken';
import { IUsuari } from '../models/users/user.model';
import { UserRole } from '../types';
import { ModelType } from '../types';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret_123';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_123';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface AccessTokenPayload {
    userId: string; // MongoId de User o Treballador (depenent del cas)
    modelType: ModelType; // 'User' o 'Treb'
    role?: UserRole; // Rol de l'usuari (Admin, Controller, Treballador)
    locId?: string; // MongoId del Local on treballa (si escau)
    //isMomentumAdmin?: boolean; // Si és un admin de Momentum
  }

export interface RefreshTokenPayload {
  userId: string; // MongoId de User o Treballador (depenent del cas)
  modelType: ModelType;
}

export const generateAccessToken = (_userId: string, _type: ModelType, _role?: UserRole, _locId?: string): string => {
  const payload: AccessTokenPayload = {
    userId: _userId,
    modelType: _type,
    ...( _role && { role: _role } ),
    ...( _locId && { locId: _locId } ), // Only include locId if it's defined
  };
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

export const generateRefreshToken = (_userId: string, _type: ModelType): string => {
  const payload: RefreshTokenPayload = {
    userId: _userId,
    modelType: _type,
  };
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, JWT_ACCESS_SECRET) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
};