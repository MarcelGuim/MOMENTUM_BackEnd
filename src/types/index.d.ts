
import { TokenPayload } from '../utils/jwt.utils';
import { Request } from 'express';

export interface LoginRequestBody {
    name_or_mail: string;
    password: string;
  }
declare global {
  namespace Express {
    export interface Request {
      user?: TokenPayload;
    }
  }
}

// Optionally, if you want a custom request interface in your middleware:
/*
export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}
*/