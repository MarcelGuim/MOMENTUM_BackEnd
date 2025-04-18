import { promises } from 'dns';
import {IChat, IMessage} from './chat.model';
import Chat from './chat.model';
import User from '../users/user.model';


export class ChatService {
    async getChat(user1ID:string, user2ID:string): Promise<IChat> {
        const user1 = await User.findById(user1ID);
        const user2 = await User.findById(user2ID);
        if (user1 === null || user2 === null) throw new Error("Users not found");
        const chat:IChat | null = await Chat.findOne({$or: [{user1: user1ID, user2: user2ID}, {user1: user2ID, user2: user1ID}]});
        if (chat === null) throw new Error("Chat not found");
        return chat;
    }

    async getChatId(user1ID:string, user2ID:string): Promise<String> {
        const user1 = await User.findById(user1ID);
        const user2 = await User.findById(user2ID);
        if (user1 === null || user2 === null) throw new Error("Users not found");
        const chat:IChat | null = await Chat.findOne({$or: [{user1: user1ID, user2: user2ID}, {user1: user2ID, user2: user1ID}]});
        if (chat === null) throw new Error("Chat not found");
        return chat._id?.toString() || ""; 
    }

    async sendMessage(chatId: string, userFrom:string, message:string): Promise<Boolean | null> {
        const chatForTest = await Chat.findById(chatId);
        if (chatForTest === null) throw new Error("Chat not found");
        const user1 = await User.findById(chatForTest.user1);
        const user2 = await User.findById(chatForTest.user2);
        if (user1 === null || user2 === null) throw new Error("Users not found");
        if ( user1.name !== userFrom && user2.name !== userFrom) throw new Error("User not in chat");
        const messageToBeSaved: IMessage = {
            from: userFrom,
            text: message,
            received: false,
            timestamp: new Date()
          };        
        const chat = await Chat.findByIdAndUpdate(chatId, {$push: { messages: messageToBeSaved } }, {new: true});
        if (chat) return true;
        else return false;
    }

    async getPeopleWithWhomUserChatted(userId: string): Promise<[string,string][]> {
        const user = await User.findById(userId);
        if (user === null) throw new Error("User not found");
        const chats = await Chat.find({$or: [{user1: userId}, {user2: userId}]});
        const people = chats.map(chat => chat.user1.toString() === userId ? chat.user2.toString() : chat.user1.toString());
        const peopleNames = await Promise.all(people.map(async (personId) => { 
            const user = await User.findById(personId); 
            return user?.name && user?._id ? [user.name, user._id.toString()] : null; 
        }));
        return peopleNames.filter((entry): entry is [string, string] => entry !== null);
    }

    async createChat(user1ID: string, user2ID: string): Promise<IChat> {
        try {
            const chat = this.getChat(user1ID, user2ID);
            if (chat !== null) throw new Error("Chat already exists");
            throw new Error();
        }
        catch (error) {
            const chat = new Chat({
                user1: user1ID,
                user2: user2ID,
                messages: []
            });
            return await chat.save();
        }
    }


    async getLast20MessagesOfChat(chatId: string): Promise<IMessage[]> {
        console.log(chatId);
        const chat = await Chat.findById(chatId);
        if (chat === null) throw new Error("Chat not found");
        return await chat.messages.slice(-20).reverse();
    }

}