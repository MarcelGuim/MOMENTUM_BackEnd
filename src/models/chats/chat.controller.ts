import { Request, Response } from 'express';
import { IChat } from './chat.model';
import { ChatService } from './chat.services';

const chatService = new ChatService();

export async function sendMessage(req:Request, res:Response): Promise<Response> {
    console.log("sending message");
    try{
        const{from, to, message, recieved} = req.body as IChat;
        const newChat: Partial<IChat> = {from, to, message, recieved};
        console.log("Sending chat:", { from,to,message,recieved });
        const chat = await chatService.sendMessage(newChat);
        return res.status(200).json({
            message:"Chat sent",
            chat
        });
    }
    catch(error){
        return res.status(500).json({ error: 'Failed to send chat' });
    }
}

export async function getPeopleWithWhomUserChatted(req:Request, res:Response): Promise<Response>{
    try{
        const name1 = req.params.name;
        const people = await chatService.getPeopleWithWhomUserChatted(name1);
        if(people.length === 0){
            console.log("No people found");
            return res.status(404).json({error: 'No people found'});
        }
        else{
            console.log("People found");
            return res.status(200).json(people);
        }
    }
    catch(error){
        return res.status(500).json({ error: 'Failed to get people' });
    }
}

export async function getChatsWithUser(req:Request, res:Response): Promise<Response>{
    try{
        const{name1, name2} = req.params;
        const chats = await chatService.getChatsWithUser(name1, name2);
        if(chats.length === 0){
            console.log("No chats found");
            return res.status(404).json({error: 'No chats found'});
        }
        else{
            console.log("Chats found");
            return res.status(200).json(chats);
        }
    }
    catch(error){
        return res.status(500).json({ error: 'Failed to get chats' });
    }
}   