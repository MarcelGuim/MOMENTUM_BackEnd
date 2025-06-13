import User from '../users/user.model';
import Worker from '../worker/worker.model';
import { IUsuari } from '../users/user.model';
import { IWorker } from '../worker/worker.model';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../../utils/jwt.utils';
import { ModelType } from '../../types';

export class AuthService {
  async loginUser(identifier:string, password:string, fcmToken?: string){
    const isEmail = identifier.includes('@');
    const query = isEmail ? { mail: identifier } : { name: identifier };

    const user = await User.findOne(query).select('+password');
    if (!user) {
      throw new Error('User not found');
    }
    const isMatch : boolean = await user.isValidPassword(password);
    if(!isMatch){
      throw new Error('Invalid password');
    }

    //s'actualitza el fcmToken 
    if (fcmToken) { 
      user.fcmToken = fcmToken; 
      await user.save(); 
    }
    const accessToken = generateAccessToken(user.id, ModelType.USER);
    const refreshToken = generateRefreshToken(user.id, ModelType.USER);

    
    const userWithoutPassword = user.toObject() as Partial<IUsuari>;
    delete userWithoutPassword.password;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(userId: string, modelType: ModelType) {
    let accessToken;
    if (modelType == ModelType.USER) {
      const user = await User.findById(userId).select('+mail +isDeleted');

      if (!user || user.isDeleted) {
        throw new Error('Invalid or inactive user');
      }

      accessToken = generateAccessToken(userId, modelType);
    } else if (modelType == ModelType.TREB) {
      const worker = await Worker.findById(userId).select('+mail +isDeleted');

      if (!worker || worker.isDeleted) {
        throw new Error('Invalid or inactive worker');
      }

      accessToken = generateAccessToken(userId, modelType);
    } else {
      throw new Error('Invalid model type');
    }
    // 3. Generate tokens
    return {
      accessToken,
    };
  }
  ////////////////////////////////////////////////////////
  // Business Part
  async loginWorker(identifier: string, password: string) {
    const isEmail = identifier.includes('@');
    const query = isEmail ? { mail: identifier } : { name: identifier };
    const worker = await Worker.findOne(query).select('+password');
    if (!worker) {
      throw new Error('User not found');
    }
    const isMatch: boolean = await worker.isValidPassword(password);
    if (!isMatch) {
      throw new Error('Invalid password');
    }
    const accessToken = generateAccessToken(
      worker.id,
      ModelType.TREB,
      worker.role
    );
    const refreshToken = generateRefreshToken(worker.id, ModelType.TREB);

    const workerWithoutPassword = worker.toObject() as Partial<IWorker>;
    delete workerWithoutPassword.password;

    return {
      worker: workerWithoutPassword,
      accessToken,
      refreshToken,
    };
  }
}
