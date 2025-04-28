
import { AccessTokenPayload } from '../utils/jwt.utils';
import { RefreshTokenPayload } from '../utils/jwt.utils';
import { Request } from 'express';

export interface LoginRequestBody {
    name_or_mail: string;
    password: string;
  }

export enum ModelType {
  USER = 'User',
  TREB = 'Treballador',
}

export enum UserRole {
  ADMIN = 'Admin',
  CONTROLLER = 'Controller',
  EMPLOYEE = 'Employee'
}

//Redeclarem Request per tal que accepti Decoded Payoloads
declare global {
  namespace Express {
    export interface Request {
      userPayload?: AccessTokenPayload; // for access token
      refreshPayload?: RefreshTokenPayload;
    }
  }
}