import mongoose from 'mongoose';

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
        required: true, 
        //unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    available:{
        type:Boolean,
        required:true,
        default: true
    }
});

export interface IUsuari{
    _id?:mongoose.ObjectId
    name: string;
    age: number;
    mail: string;
    password: string;
    available:boolean;
}


const User = mongoose.model<IUsuari>('User', UserSchema);
export default User;