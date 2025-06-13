import User from '../users/user.model';
import Worker from '../worker/worker.model';
import { IUsuari } from '../users/user.model';
import { IWorker } from '../worker/worker.model';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt.utils';
import { ModelType } from '../../types'; 

export class AuthService {
  async loginUser(identifier:string, password:string, fcmToken?: string){
    console.log("🟡 Iniciant loginUser");
    console.log("📨 Rebut identifier:", identifier);
    console.log("📨 Rebut password:", password);
    console.log("📨 Rebut fcmToken:", fcmToken);
    const isEmail = identifier.includes('@');
    console.log("📧 És un correu?", isEmail);
    const query = isEmail ? { mail: identifier } : { name: identifier };
    console.log("🔍 Buscant usuari amb query:", query);

    const user = await User.findOne(query).select('+password');
    if (!user) {
      console.error("❌ Usuari no trobat!");
      throw new Error('User not found');
    }
    console.log("✅ Usuari trobat:", user.name || user.mail);
    const isMatch : boolean = await user.isValidPassword(password);
    console.log("🔐 Resultat de la comparació de contrasenya:", isMatch);
    if(!isMatch){
      console.error("❌ Contrasenya incorrecta!");
      throw new Error('Invalid password');
    }

    //s'actualitza el fcmToken 
    if (fcmToken) { 
      user.fcmToken = fcmToken; 
      await user.save(); 
      console.log("📲 FCM Token actualitzat:", fcmToken);
    }
    const accessToken = generateAccessToken(user.id, ModelType.USER);
    const refreshToken = generateRefreshToken(user.id, ModelType.USER);
    console.log("🔑 AccessToken generat:", accessToken);
    console.log("🔁 RefreshToken generat:", refreshToken);
    
    const userWithoutPassword = user.toObject() as Partial<IUsuari>;
    delete userWithoutPassword.password;
    console.log("✅ Login completat correctament");

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
  ////////////////////////////////////////////////////////
  // Business Part
    async loginWorker(identifier:string, password:string){
    const isEmail = identifier.includes('@');
    const query = isEmail ? { mail: identifier } : { name: identifier };
    const worker = await Worker.findOne(query).select('+password');
    if (!worker) {
      throw new Error('User not found');
    }
    const isMatch : boolean = await worker.isValidPassword(password);
    if(!isMatch){
      throw new Error('Invalid password');
    }
    const accessToken = generateAccessToken(worker.id, ModelType.TREB, worker.role);
    const refreshToken = generateRefreshToken(worker.id, ModelType.TREB);
    
    const workerWithoutPassword = worker.toObject() as Partial<IWorker>;
    delete workerWithoutPassword.password;

    return {
      worker: workerWithoutPassword,
      accessToken,
      refreshToken
    };
  }
}