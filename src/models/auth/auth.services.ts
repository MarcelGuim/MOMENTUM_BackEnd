import User from '../users/user.model';
import Worker from '../worker/worker.model';
//import { hash } from 'bcrypt';
import axios from 'axios';
import { IUsuari } from '../users/user.model';
import { IWorker } from '../worker/worker.model';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../../utils/jwt.utils';
import { ModelType } from '../../types';
import dotenv from 'dotenv';
dotenv.config();

export class AuthService {
  async loginUser(identifier: string, password: string, fcmToken?: string) {
    const isEmail = identifier.includes('@');
    const query = isEmail ? { mail: identifier } : { name: identifier };

    const user = await User.findOne(query).select('+password');
    if (!user) {
      throw new Error('User not found');
    }
    const isMatch: boolean = await user.isValidPassword(password);
    if (!isMatch) {
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

  async googleAuth(code: string) {
    try {
      console.log(
        'Client ID:',
        '104261057122-bd1sulgdh5m811ppg1tfgev3jqidnb3u.apps.googleusercontent.com'
      );
      console.log('Client Secret:', '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');
      console.log(
        'Redirect URI:',
        'http://localhost:9000/api/auth/google/callback'
      ); // modificar uri per la ruta de angular quan exitsteixi.
      interface TokenResponse {
        access_token: string;
        expires_in: number;
        scope: string;
        token_type: string;
        id_token?: string;
      }
      //axios --> llibreria que s'utilitza per a fer peticions HTTP
      const tokenResponse = await axios.post<TokenResponse>(
        'https://oauth2.googleapis.com/token',
        {
          code,
          client_id:
            '104261057122-bd1sulgdh5m811ppg1tfgev3jqidnb3u.apps.googleusercontent.com',
          client_secret: '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',
          redirect_uri: `${process.env.APP_BASE_URL}/auth/google/callback`,
          grant_type: 'authorization_code',
        }
      );

      const access_token = tokenResponse.data.access_token;
      console.log('Access Token:', access_token);
      // Obté el perfil d'usuari
      const profileResponse = await axios.get(
        'https://www.googleapis.com/oauth2/v1/userinfo',
        {
          params: { access_token },
          headers: { Accept: 'application/json' },
        }
      );

      const profile = profileResponse.data as { name: string; email: string };
      console.log('Access profile:', profile);
      // Busca o crea el perfil a la BBDD
      let user = await User.findOne({
        $or: [{ name: profile.name }, { mail: profile.email }],
      });

      if (!user) {
        const randomPassword = Math.random().toString(36).slice(-8);
        //const passHash = await hash(randomPassword, 10); //possible punt de conflicte: sinó fer-ho amb bcrypt.
        user = await User.create({
          name: profile.name,
          mail: profile.email,
          password: randomPassword,
          age: 18,
        });
      }

      // Genera el token JWT
      const accessToken = generateAccessToken(
        user._id.toString(),
        ModelType.USER
      );
      const refreshToken = generateRefreshToken(
        user.id.toString(),
        ModelType.USER
      );

      console.log(accessToken, refreshToken);
      console.log('User Id:', user._id);
      return { accessToken, refreshToken, user };
    } catch (error: any) {
      console.error(
        'Google Auth Error:',
        error.response?.data || error.message
      ); // Log detallado
      throw new Error('Error en autenticación con Google');
    }
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
