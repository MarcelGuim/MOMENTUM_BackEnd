import mongoose, { Schema, model, Document } from 'mongoose';

const ChatSchema = new Schema<IChat>({
    user1: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true 
    },
    user2: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true 
    },
    messages: [
        {
          from: { type: String, required: true },
          text: { type: String, required: true },
          timestamp: { type: Date, required: true },
          _id: false
        }
      ]//El format del missatge és: [Emisor (el receptor ja és implicit), missatge, rebut? (True/False)]
});

export interface IChat{
    user1: mongoose.Types.ObjectId;
    user2: mongoose.Types.ObjectId;
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