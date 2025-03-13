import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
export interface IUsuari {
    _id?: mongoose.ObjectId;
    name: string;
    age: number;
    mail: string;
    password: string;
    isDeleted: boolean;
    isValidPassword: (password: string) => Promise<boolean>;
    activationId?: string;
}


const UserSchema = new mongoose.Schema<IUsuari>({
    name: { 
        type: String, 
        required: true,
        unique: true
    },
    age: { 
        type: Number, 
        required: true 
    },
    mail: { 
        type: String, 
        required: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    isDeleted: {
        type: Boolean,
        required: true, 
        default: false
    }
});

UserSchema.pre('find', function() {
  this.where({ isDeleted: false });
});

UserSchema.pre('findOne', function() {
  this.where({ isDeleted: false });
});

UserSchema.pre('save',async function(next) {
    const hashedPassword= await bcrypt.hash(this.password, bcrypt.genSaltSync(8));
    this.password = hashedPassword;
    next();
});

UserSchema.method('isValidPassword',async function(password: string): Promise<boolean> {
    const isValid =  await bcrypt.compare(password, this.password);
    return isValid;
});


const User = mongoose.model<IUsuari>('User', UserSchema);

export default User;