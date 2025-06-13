import { typeOfXatUser } from 'enums/typesOfXat.enum';
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

export interface SocketMessage {
  receiverId: string;
  receiverType: typeOfXatUser;
  senderName: string;
  senderId: string;
  chatId: string;
  message: string;
}

export interface TypingSocketMessage {
  receiverId: string;
  receiverType: typeOfXatUser;
  senderName: string;
  chatId: string;
}

export interface JoinRoomRequest {
  userId: string;
  rooms: string[];
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
