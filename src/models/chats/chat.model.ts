import { Schema, model, Document } from 'mongoose';

const ChatSchema = new Schema<IChat>({
    from: { 
        type: String, 
        required: true 
    },
    to: { 
        type: String, 
        required: true, 
    },
    message: { 
        type: String, 
        required: true 
    },
    recieved:{
        type: Boolean,
        default: false
    }
});

export interface IChat{
    from: string;
    to: string;
    message: string;
    recieved: boolean;
}


const Chat = model<IChat>('Chat', ChatSchema);
export default Chat;