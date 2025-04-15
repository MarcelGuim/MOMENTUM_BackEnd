import User from '../users/user.model';
import { IUsuari } from '../users/user.model';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt.utils';
import { UserRole } from '../../types';
import { ModelType } from '../../types'; 
import axios from 'axios';
import { encrypt } from '../../utils/bcrypt.handle'; // Adjust the path as needed

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
  async googleAuth(code: string) {

    try {
        console.log("Client ID:", '104261057122-bd1sulgdh5m811ppg1tfgev3jqidnb3u.apps.googleusercontent.com');
        console.log("Client Secret:", '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');
        console.log("Redirect URI:", 'http://localhost:9000/api/auth/google/callback'); // modificar uri per la ruta de angular quan exitsteixi.
      interface TokenResponse {
            access_token: string;
            expires_in: number;
            scope: string;
            token_type: string;
            id_token?: string;
        }
        //axios --> llibreria que s'utilitza per a fer peticions HTTP
        const tokenResponse = await axios.post<TokenResponse>('https://oauth2.googleapis.com/token', {
            code,
            client_id: '104261057122-bd1sulgdh5m811ppg1tfgev3jqidnb3u.apps.googleusercontent.com',
            client_secret: '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',
            redirect_uri: 'http://localhost:8080/auth/google/callback' ,
            grant_type: 'authorization_code'
        });

        const access_token = tokenResponse.data.access_token;
        console.log("Access Token:", access_token); 
        // Obté el perfil d'usuari
        const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
            params: { access_token},
            headers: { Accept: 'application/json',},
            
        });

        const profile = profileResponse.data as {name:string, email: string };
        console.log("Access profile:", profile); 
        // Busca o crea el perfil a la BBDD
        let user = await User.findOne({ 
            $or: [{name: profile.name},{ mail: profile.email }] 
        });

        if (!user) {
            const randomPassword = Math.random().toString(36).slice(-8);
            const passHash = await encrypt(randomPassword);
            user = await User.create({
                name: profile.name,
                mail: profile.email,
                password: passHash,
            });
        }

        // Genera el token JWT
        const accessToken = generateAccessToken(user.id, ModelType.USER);
        const refreshToken = generateRefreshToken(user.id, ModelType.USER);

        console.log(accessToken, refreshToken);
        return { accessToken, refreshToken, user };

    } catch (error: any) {
        console.error('Google Auth Error:', error.response?.data || error.message); // Log detallado
        throw new Error('Error en autenticación con Google');
    }
  };
}