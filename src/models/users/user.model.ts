import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
export interface IUsuari {
    _id?: mongoose.ObjectId;
    name: string;
    age: number;
    mail: string;
    password: string;
    isDeleted: boolean;
    activationId?: string;
    favoriteLocations: mongoose.Types.ObjectId[];
    friends: mongoose.Types.ObjectId[];
    friendRequests: mongoose.Types.ObjectId[];
    fcmToken: string;
    isValidPassword: (password: string) => Promise<boolean>;
}

const UserSchema = new mongoose.Schema<IUsuari>({
    name: { 
        type: String, 
        required: true,
        unique: true,
        index: true 
    },
    age: { 
        type: Number, 
        required: true 
    },
    mail: { 
        type: String, 
        required: true,
        unique: true, 
        index: true 
    },
    password: { 
        type: String, 
        required: true,
        select: false  
    },
    isDeleted: {
        type: Boolean,
        required: true, 
        default: false
    },
    activationId: {
        type: String,
        sparse: true ,
        select: false
    },
    favoriteLocations: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Location',
          default: [],
        },
    ],
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],
    friendRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],
    fcmToken: {
        type: String,
        default: null
    }
});

// UserSchema.pre('find', function() {
//   this.where({ isDeleted: false });
// });

UserSchema.pre('findOne', function() {
  this.where({ isDeleted: false });
});
/*
UserSchema.pre('save',async function(next) {
    if (!this.isModified('password')) return next();
    const hashedPassword= await bcrypt.hash(this.password, bcrypt.genSaltSync(8));
    this.password = hashedPassword;
    next();
});
*/
UserSchema.pre('save', async function (next) {
  console.log('🔐 [UserSchema] Executant pre-save hook per hash de contrasenya');

  if (!this.isModified('password')) {
    console.log('ℹ️ [UserSchema] La contrasenya no ha estat modificada. Es continua sense fer hash.');
    return next();
  }

  try {
    console.log('🔧 [UserSchema] Hashing de la nova contrasenya...');
    const hashedPassword = await bcrypt.hash(this.password, bcrypt.genSaltSync(8));
    this.password = hashedPassword;
    console.log('✅ [UserSchema] Contrasenya hashada correctament.');
    next();
  } catch (error) {
    console.error('❌ [UserSchema] Error hashant la contrasenya:', error);
    next();
  }
});

UserSchema.method('isValidPassword',async function(password: string): Promise<boolean> {
    const isValid =  await bcrypt.compare(password, this.password);
    return isValid;
});


const User = mongoose.model<IUsuari>('User', UserSchema);

export default User;