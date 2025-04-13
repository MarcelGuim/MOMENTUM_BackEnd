import User from '../users/user.model';
import { IUsuari } from '../users/user.model';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt.utils';
import { UserRole } from '../../types';
import { ModelType } from '../../types'; 



export class AuthService {
  async loginUser(identifier:string, password:string){
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
    const accessToken = generateAccessToken(user.id, ModelType.USER);
    const refreshToken = generateRefreshToken(user.id, ModelType.USER);
    
    const userWithoutPassword = user.toObject() as Partial<IUsuari>;
    delete userWithoutPassword.password;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken
    };
  }

  async refreshTokens(userId: string, modelType: ModelType) {
    let accessToken;
    if (modelType == ModelType.USER) {
      const user = await User.findById(userId)
      .select('+mail +isDeleted');

      if (!user || user.isDeleted) {
        throw new Error('Invalid or inactive user');
      }

      accessToken = generateAccessToken(userId, modelType);
    }
    else if (modelType == ModelType.TREB) {
      /* PSEUDOCODE PER QUAN HO TIGNUEM
      user = await.Treballador.findById(userId)
      .select('+mail +isDeleted');
      */
    }
    else {
      throw new Error('Invalid model type');
    }
    // 3. Generate tokens
    return {
      accessToken,
    };
  }
}