import { Schema, model, Document } from 'mongoose';

const UserSchema = new Schema<IUsuari>({
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
    }
});

export interface IUsuari{
    name: string;
    age: number;
    mail: string;
    password: string;
}


const User = model<IUsuari>('User', UserSchema);
export default User;