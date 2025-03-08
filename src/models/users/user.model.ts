import mongoose from 'mongoose';

export interface IUsuari {
    _id?: mongoose.ObjectId;
    name: string;
    age: number;
    mail: string;
    password: string;
    isDeleted: boolean;
}

const UserSchema = new mongoose.Schema<IUsuari>({
    name: { 
        type: String, 
        required: true 
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

const User = mongoose.model<IUsuari>('User', UserSchema);

export default User;