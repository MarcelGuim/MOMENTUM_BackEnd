import { AccessTokenPayload } from '../utils/jwt.utils';
import { RefreshTokenPayload } from '../utils/jwt.utils';

export interface LoginRequestBody {
  name_or_mail: string;
  password: string;
}

export interface BusinessRegisterRequestBody {
  name: string;
  age: number;
  mail: string;
  password: string;
  businessName: string;
}
/* eslint-disable no-unused-vars */
export enum ModelType {
  USER = 'User',
  TREB = 'Treballador',
}
/* eslint-enable no-unused-vars */
export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
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
