import { Request, Response } from 'express';
import { LoginRequestBody, BusinessRegisterRequestBody } from '../../types';
import { AuthService } from './auth.services';
import { UserService } from '..//users/user.services';
import { ModelType } from '../../types';
import {
  AccessTokenPayload,
  refreshTokenCookieOptions,
} from '../../utils/jwt.utils';
import { IBusiness } from '../../models/business/business.model';
import { IWorker } from '../../models/worker/worker.model';
import { WorkerRole } from '../../enums/workerRoles.enum';
import { BusinessService } from '../../models/business/business.services';
import { WorkerService } from '../../models/worker/worker.services';
import { IUsuari } from 'models/users/user.model';
import dotenv from 'dotenv';
dotenv.config();

const authService = new AuthService();
const userService = new UserService();
const businessService = new BusinessService();
const workerService = new WorkerService();

export const loginUser = async (req: Request, res: Response) => {
  try {
      const { name_or_mail, password, fcmToken } = req.body as LoginRequestBody & { fcmToken?: string };
      const { user, accessToken, refreshToken } = await authService.loginUser(name_or_mail, password, fcmToken);
  
      res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);


      return res.status(200).json({
        user,
        accessToken // Store this in localStorage
      });
    } catch (error: any) {
      return res.status(401).json({ 
        error: "Invalid Credentials", 
        details: error.message 
      });
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
    console.log('Extracted modelType: ', modelType || 'UNDEFINED');
    if (!userId || !modelType) {
      console.error('Invalid token payload - missing required fields');
      throw new Error('Invalid token payload');
    }

    const { accessToken } = await authService.refreshTokens(userId, modelType);

    console.log('Tokens generated:', {
      accessToken: accessToken
        ? `${accessToken.substring(0, 10)}...`
        : 'UNDEFINED',
    });

    return res.json({
      accessToken,
      debug:
        process.env.NODE_ENV === 'development'
          ? {
              userId,
              tokenExpiresIn: '15m', // Match your JWT expiry
            }
          : undefined,
    });
  } catch (error: any) {
    console.error('Refresh failed:', {
      error: error.message,
      stack:
        process.env.NODE_ENV === 'development'
          ? error.stack
          : 'HIDDEN IN PRODUCTION',
      timestamp: new Date().toISOString(),
    });

    return res.status(401).json({
      error: error.message || 'Token refresh failed',
      ...(process.env.NODE_ENV === 'development' && {
        details: {
          suggestion: 'Check if user exists and refresh token is valid',
          timestamp: new Date().toISOString(),
        },
      }),
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    if (!req.refreshPayload) {
      return res.status(400).json({ error: 'No refresh token found' });
    }

    // 2. Add token to blacklist (if using token invalidation)
    // await tokenService.blacklistToken(refreshToken);

    // 3. Clear the refresh token cookie
    const clearCookieOptions = { ...refreshTokenCookieOptions };
    delete clearCookieOptions.maxAge;
    res.clearCookie('refreshToken', clearCookieOptions);

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Falta acabar quan hi hagin els dos models
export const validateToken = async (req: Request, res: Response) => {
  try {
    const payload = req.userPayload as AccessTokenPayload;
    if (!payload?.userId || !payload.modelType) {
      console.error('Invalid token payload structure', payload);
      throw new Error('INVALID_TOKEN_PAYLOAD');
    }

    let userEntity;
    switch (payload.modelType) {
      case ModelType.USER:
        userEntity = await userService.getUserById(payload.userId);
        break;
      // case ModelType.TREB:  // Uncomment when implemented
      //   userEntity = await employeeService.getEmployeeById(payload.userId);
      //   break;
      default:
        console.error('Unknown model type', payload.modelType);
        throw new Error('UNKNOWN_USER_TYPE');
    }

    if (!userEntity) {
      console.error('User not found for ID:', payload.userId);
      throw new Error('USER_NOT_FOUND');
    }

    return res.status(200).json({
      isValid: true,
      model: payload.modelType,
    });
  } catch (error: any) {
    return res.status(401).json({
      isValid: false,
      error: error.message || 'Invalid token',
      code: error.message || 'INVALID_TOKEN',
    });
  }
};

////////////////////////////////////////////////////////
// Business Part

export const registerBusiness = async (req: Request, res: Response) => {
  try {
    const { name, mail, age, password, businessName } =
      req.body as BusinessRegisterRequestBody;
    const buss: IBusiness = {
      name: businessName,
      location: [],
      isDeleted: false,
    };
    const businessResult = await businessService.createBusiness(buss);

    if (typeof businessResult === 'number' && businessResult > 0) {
      return res.status(400).json({
        message: `There are ${businessResult} invalid locations when creating business`,
      });
    }
    if (typeof businessResult === 'number' && businessResult === -1) {
      return res.status(409).json({ message: 'The business already exists' });
    }
    if (typeof businessResult === 'number' && businessResult === -2) {
      return res
        .status(400)
        .json({ message: 'The IDs format of locations is not valid' });
    }
    if (typeof businessResult !== 'object' || businessResult === null) {
      return res
        .status(500)
        .json({ message: 'Unexpected error when creating business' });
    }

    const worker: Partial<IWorker> = {
      name: name,
      age: age,
      mail: mail,
      role: WorkerRole.ADMIN,
      location: [],
      businessAdministrated: businessResult._id,
      password: password,
      isDeleted: false,
    };
    const workerResult = await workerService.createWorker(worker);
    if (!workerResult) {
      return res.status(409).json({ message: 'Worker already exists' });
    }

    // If both business and worker are created successfully
    return res.status(201).json({
      message: 'Business and admin created successfully',
      business: businessResult,
      admin: workerResult,
    });
  } catch {
    return res.status(500).json({ error: 'Failed to create business' });
  }
};

export const loginWorker = async (req: Request, res: Response) => {
  try {
    const { name_or_mail, password } = req.body as LoginRequestBody;
    const { worker, accessToken, refreshToken } = await authService.loginWorker(
      name_or_mail,
      password
    );
    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);
    console.log('Sending refreshToken in cookie:', refreshToken);
    console.log('Sending accessToken in response:', accessToken);
    return res.status(200).json({
      worker,
      accessToken, // Store this in localStorage
    });
  } catch {
    return res.status(401).json({ error: 'Invalid Credentials' });
  }
};

export const googleAuthCtrl = async (req: Request, res: Response) => {
  const redirectUri = `${process.env.APP_BASE_URL}/auth/google/callback`; // modificar uri per la ruta de angular quan exitsteixi.

  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth'; //ojo tema versió
  const options = new URLSearchParams({
    // codi amb el que google respon
    redirect_uri: redirectUri!,
    client_id:
      '104261057122-bd1sulgdh5m811ppg1tfgev3jqidnb3u.apps.googleusercontent.com'!,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope:
      'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
  });
  const fullUrl = `${rootUrl}?${options.toString()}`;
  console.log('Redireccionando a:', fullUrl);
  res.redirect(fullUrl);
};

export const googleAuthCallback = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    console.log('Código de autorización:', code);
    const platform = req.query.state || 'web';
    if (!code) {
      return res
        .status(400)
        .json({ message: 'Código de autorización faltante' });
    }

    const authData = await authService.googleAuth(code);

    if (!authData) {
      return res.redirect('/login?error=authentication_failed');
    }

    console.log(authData.accessToken);
    // Configurar cookies no https (secure)--> acces des del web.
    res.cookie('token', authData.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'none',
      maxAge: 86400000, // 1 día
    });
    res.cookie(
      'refreshToken',
      authData.refreshToken,
      refreshTokenCookieOptions
    );

    console.log(authData.accessToken);
    if (platform === 'mobile') {
      // Redirigir a deep link para mobile
      res.redirect(`momentum://auth?token=${authData.accessToken}`);
    } else {
      // Redirigir a URL web (ajusta el puerto según tu app Flutter web)
      res.redirect(
        `${process.env.FRONTEND_URL}/auth-callback?token=${authData.accessToken}&refreshToken=${authData.refreshToken}&userId=${authData.user._id}`
      ); // cal ajustar per a web
    }
  } catch (error: any) {
    console.error('Error en callback de Google:', error);
    res.redirect('/login?error=server_error');
  }
};

export async function validateLogin(
  req: Request,
  res: Response
): Promise<Response> {
  const id = req.userPayload?.userId;
  if (!id) return res.status(400);
  const role = req.userPayload?.modelType;
  console.log(role);
  if (role == 'User') {
    const user: IUsuari | null = await userService.getUserById(id);
    return res.status(200).json({ type: 'user', data: user });
  } else if (role == 'Treballador') {
    const worker: IWorker | null = await workerService.getWorkerById(id);
    return res.status(200).json({ type: 'worker', data: worker });
  }
  return res.status(500);
}
