import mongoose, { Schema, model, Document } from 'mongoose';
import { typeOfXatUser } from '../../enums/typesOfXat.enum';
const ChatSchema = new Schema<IChat>({
    user1: { 
        type: mongoose.Schema.Types.ObjectId,
        required: true 
    },
    typeOfUser1: {
        type: String,
        enum: Object.values(typeOfXatUser),
        required: true,
    },
    user2: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },
    typeOfUser2: {
        type: String,
        enum: Object.values(typeOfXatUser),
        required: true,
    },
    messages: [
        {
          from: { type: String, required: true },
          text: { type: String, required: true },
          timestamp: { type: Date, required: true },
          _id: false
        }
    ],
});

export interface IChat{
    user1: mongoose.Types.ObjectId;
    typeOfUser1: typeOfXatUser;
    user2: mongoose.Types.ObjectId;
    typeOfUser2: typeOfXatUser;
    messages: IMessage[];
    _id?: mongoose.Types.ObjectId;
}

export interface IMessage {
    from: string;
    text: string;
    timestamp: Date;
}

const Chat = model<IChat>('Chat', ChatSchema);
export default Chat;