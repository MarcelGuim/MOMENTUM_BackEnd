import { promises } from 'dns';
import {IChat, IMessage} from './chat.model';
import Chat from './chat.model';
import User, { IUsuari } from '../users/user.model';
import Worker, {IWorker} from '../worker/worker.model';
import Location, {ILocation} from '../location/location.model';
import Business, {IBusiness} from '../business/business.model';
import { typeOfXatUser } from 'enums/typesOfXat.enum';

export class ChatService {
    async getChat(user1ID:string, user2ID:string): Promise<IChat> {
/*         const user1 = await User.findById(user1ID);
        const user2 = await User.findById(user2ID);
        if (user1 === null || user2 === null) throw new Error("Users not found"); */
        const chat:IChat | null = await Chat.findOne({$or: [{user1: user1ID, user2: user2ID}, {user1: user2ID, user2: user1ID}]});
        if (chat === null) throw new Error("Chat not found");
        return chat;
    }
/*     async getChatBetweenWorker(worker1ID:string, worker2ID:string): Promise<IChat> {
        const worker1 = await Worker.findById(worker1ID);
        const worker2 = await Worker.findById(worker2ID);
        if (worker1 === null || worker2 === null) throw new Error("Workers not found");
        const chat:IChat | null = await Chat.findOne({$or: [{user1: worker1ID, user2: worker2ID}, {user1: worker2ID, user2: worker1ID}]});
        if (chat === null) throw new Error("Chat not found");
        return chat;
    }
    async getChatBetweenWorkerAndUser(userID:string, workerID:string): Promise<IChat> {
        const user = await User.findById(userID);
        const worker = await Worker.findById(workerID);
        if (user === null || worker === null) throw new Error("Workers not found");
        const chat:IChat | null = await Chat.findOne({$or: [{user1: userID, user2: workerID}, {user1: workerID, user2: userID}]});
        if (chat === null) throw new Error("Chat not found");
        return chat;
    }
    async getChatBetweenWorkerAndLocation(userID:string, locationID:string): Promise<IChat> {
        const user = await User.findById(userID);
        const location = await Location.findById(locationID);
        if (user === null || location === null) throw new Error("Workers not found");
        const chat:IChat | null = await Chat.findOne({$or: [{user1: userID, user2: locationID}, {user1: locationID, user2: userID}]});
        if (chat === null) throw new Error("Chat not found");
        return chat;
    }
    async getChatBetweenWorkerAndBusiness(userID:string, businessID:string): Promise<IChat> {
        const user = await User.findById(userID);
        const business = await Business.findById(businessID);
        if (user === null || business === null) throw new Error("Workers not found");
        const chat:IChat | null = await Chat.findOne({$or: [{user1: userID, user2: businessID}, {user1: businessID, user2: userID}]});
        if (chat === null) throw new Error("Chat not found");
        return chat;
    } */

    async getChatId(user1ID:string, user2ID:string): Promise<String> {
/*         const user1 = await User.findById(user1ID);
        const user2 = await User.findById(user2ID);
        if (user1 === null || user2 === null) throw new Error("Users not found"); */
        const chat:IChat | null = await Chat.findOne({$or: [{user1: user1ID, user2: user2ID}, {user1: user2ID, user2: user1ID}]});
        if (chat === null) throw new Error("Chat not found");
        return chat._id?.toString() || ""; 
    }
/*     async getChatIdBetweenWorker(worker1ID:string, worker2ID:string): Promise<IChat> {
        const worker1 = await Worker.findById(worker1ID);
        const worker2 = await Worker.findById(worker2ID);
        if (worker1 === null || worker2 === null) throw new Error("Workers not found");
        const chat:IChat | null = await Chat.findOne({$or: [{user1: worker1ID, user2: worker2ID}, {user1: worker2ID, user2: worker1ID}]});
        if (chat === null) throw new Error("Chat not found");
        return chat;
    }
    async getChatIdBetweenWorkerAndUser(userID:string, workerID:string): Promise<IChat> {
        const user = await User.findById(userID);
        const worker = await Worker.findById(workerID);
        if (user === null || worker === null) throw new Error("Workers not found");
        const chat:IChat | null = await Chat.findOne({$or: [{user1: userID, user2: workerID}, {user1: workerID, user2: userID}]});
        if (chat === null) throw new Error("Chat not found");
        return chat;
    }
    async getChatIdBetweenWorkerAndLocation(userID:string, locationID:string): Promise<IChat> {
        const user = await User.findById(userID);
        const location = await Location.findById(locationID);
        if (user === null || location === null) throw new Error("Workers not found");
        const chat:IChat | null = await Chat.findOne({$or: [{user1: userID, user2: locationID}, {user1: locationID, user2: userID}]});
        if (chat === null) throw new Error("Chat not found");
        return chat;
    }
    async getChatIdBetweenWorkerAndBusiness(userID:string, businessID:string): Promise<IChat> {
        const user = await User.findById(userID);
        const business = await Business.findById(businessID);
        if (user === null || business === null) throw new Error("Workers not found");
        const chat:IChat | null = await Chat.findOne({$or: [{user1: userID, user2: businessID}, {user1: businessID, user2: userID}]});
        if (chat === null) throw new Error("Chat not found");
        return chat;
    } */
    
    async getNameFromChat(id: String, type: String): Promise<string | null> {
        try{
            if(type === "user") return await User.findById(id).then(user => user?.name || null);
            if(type === "worker") return await Worker.findById(id).then(worker => worker?.name || null);
            if(type === "location") return await Location.findById(id).then(location => location?.nombre || null);
            if(type === "business") return await Business.findById(id).then(business => business?.name || null);
            else return null;
        }
        catch (error) {
            return null;
        }
    }

    async checkIfSenderInChat(chatId: string, userFrom:string): Promise<Boolean> {
        const chat: IChat | null = await Chat.findById(chatId);
        if (chat === null) throw new Error("Chat not found");
        const name1 = await this.getNameFromChat(chat.user1.toString(), chat.typeOfUser1);
        if( name1 && name1 === userFrom) return true;
        const name2 = await this.getNameFromChat(chat.user2.toString(), chat.typeOfUser2);
        if( name2 && name2 === userFrom) return true;
        return false;
    }

    async sendMessage(chatId: string, userFrom:string, message:string): Promise<Boolean | null> {
        const chatForTest = await Chat.findById(chatId);
        if (chatForTest === null) throw new Error("Chat not found");
/*         const user1 = await User.findById(chatForTest.user1);
        const user2 = await User.findById(chatForTest.user2);
        if (user1 === null || user2 === null) throw new Error("Users not found"); */
        const check = await this.checkIfSenderInChat(chatId, userFrom);
        if (!check) throw new Error("User not in chat");
        const messageToBeSaved: IMessage = {
            from: userFrom,
            text: message,
            timestamp: new Date()
          };        
        const chat = await Chat.findByIdAndUpdate(chatId, {$push: { messages: messageToBeSaved } }, {new: true});
        if (chat) return true;
        else return false;
    }

    async getPeopleWithWhomUserChatted(userId: string): Promise<[string,string, typeOfXatUser][]> {
        const user = await User.findById(userId);
        if (user === null) throw new Error("User not found");
        const chats = await Chat.find({$or: [{user1: userId}, {user2: userId}]});
/*         const people = chats.map(chat => chat.user1.toString() === userId ? chat.user2.toString() : chat.user1.toString());
        const peopleNames = await Promise.all(people.map(async (personId) => { 
            const user = await User.findById(personId); 
            return user?.name && user?._id ? [user.name, user._id.toString()] : null; 
        }));
        return peopleNames.filter((entry): entry is [string, string] => entry !== null);
    } */
        const peopleInfo = await Promise.all(
            chats.map(async (chat) => {
                let otherId: string;
                let otherType: typeOfXatUser;

                if (chat.user1.toString() === userId) {
                    otherId = chat.user2.toString();
                    otherType = chat.typeOfUser2;
                } else {
                    otherId = chat.user1.toString();
                    otherType = chat.typeOfUser1;
                }
                const name = await this.getNameFromChat(otherId, otherType);
                if (!name) return null;
                return [name, otherId, otherType] as [string, string, typeOfXatUser];
            })
        );
        return peopleInfo.filter((entry): entry is [string, string, typeOfXatUser] => entry !== null);
    }

    async verifyIfIdExists(id: string, type: typeOfXatUser): Promise<boolean> {
       const name = await this.getNameFromChat(id, type);
       if (name) return true;
       else return false; 
    }

    async createChat(user1ID: string, typeOfUser1: typeOfXatUser, user2ID: string, typeOfUser2: typeOfXatUser): Promise<IChat> {
        try{
            const chat = await this.getChat(user1ID, user2ID);
            throw new Error("Chat already exists");
        }
        catch(error) {
        }
        const user1Exists = await this.verifyIfIdExists(user1ID, typeOfUser1);
        const user2Exists = await this.verifyIfIdExists(user2ID, typeOfUser2);
        if( !user1Exists || !user2Exists) throw new Error("One or both users not found");
        const newChat = new Chat({
            user1: user1ID,
            typeOfUser1: typeOfUser1,
            user2: user2ID,
            typeOfUser2: typeOfUser2,
            messages: []
        });
        return await newChat.save();
    }

    async getLast20MessagesOfChat(chatId: string): Promise<IMessage[]> {
        const chat = await Chat.findById(chatId);
        if (chat === null) throw new Error("Chat not found");
        return await chat.messages.slice(-20).reverse();
    }

    async getChatFromId(chatId: string): Promise <IChat | null>{
        return await Chat.findById(chatId);
    }

    async getNameFromOtherPersonInChat(chatId: string, name:string): Promise<string | null>{
        const chat:IChat | null = await this.getChatFromId(chatId);
        if (chat){
            const name1 = await this.getNameFromChat(chat.user1.toString(), chat.typeOfUser1);
            if(name1 && name1 !== name) return name1;
            const name2 = await this.getNameFromChat(chat.user2.toString(), chat.typeOfUser2);
            if(name2 && name2 !== name) return name2;
            return null;

/*             const user1:IUsuari | null = await User.findById(chat.user1);
            if(user1 && user1.name !== name)
                return user1.name;
            else{
                const user2:IUsuari | null = await User.findById(chat.user2);
                if(user2) return user2?.name;
                return null;
            } */
        }
        return null;
    }

        async getPeopleWithWhomWorkerChatted(workerId: string): Promise<[string,string, typeOfXatUser][]> {
        const worker = await Worker.findById(workerId);
        console.log("Worker found: ", worker);
        if (worker === null) throw new Error("Worker not found");
        const location = await Location.findById(worker.location);
        if (location === null) throw new Error("Location of worker not found");
        const chats = await Chat.find({$or: [{user1: workerId}, {user2: workerId}, {user2: worker.location}, {user1: worker.location}, {user2: location.business}, {user1: location.business}]});
/*         const people = chats.map(chat => chat.user1.toString() === userId ? chat.user2.toString() : chat.user1.toString());
        const peopleNames = await Promise.all(people.map(async (personId) => { 
            const user = await User.findById(personId); 
            return user?.name && user?._id ? [user.name, user._id.toString()] : null; 
        }));
        return peopleNames.filter((entry): entry is [string, string] => entry !== null);
    } */
        const peopleInfo = await Promise.all(
            chats.map(async (chat) => {
                let otherId: string;
                let otherTypeReal: typeOfXatUser;
                let otherTypeForFrontend: typeOfXatUser;

                if (chat.user1.toString() === workerId) {
                    otherId = chat.user2.toString();
                    otherTypeReal = chat.typeOfUser2;
                    otherTypeForFrontend = chat.typeOfUser1;
                } else {
                    otherId = chat.user1.toString();
                    otherTypeReal = chat.typeOfUser1;
                    otherTypeForFrontend = chat.typeOfUser2;
                }
                const name = await this.getNameFromChat(otherId, otherTypeReal);
                if (!name) return null;
                return [name, otherId, otherTypeForFrontend] as [string, string, typeOfXatUser];
            })
        );
        return peopleInfo.filter((entry): entry is [string, string, typeOfXatUser] => entry !== null);
    }
}