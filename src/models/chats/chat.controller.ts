import { Request, Response } from 'express';
import { IChat } from './chat.model';
import { ChatService } from './chat.services';

const chatService = new ChatService();

export async function sendMessage(req: Request, res: Response): Promise<Response> {
    console.log("sending message to chat ");
    try {
        const { chatId, userFrom, message } = req.body;
        console.log(chatId,userFrom,message)
        const updatedChat = await chatService.sendMessage(chatId, userFrom, message);
        if (updatedChat === true) return res.status(200).json({
            message: "Message sent successfully"
        });
        else return res.status(505).json({
            error: "Message not sent"
        });
    } catch (error: any) {
        console.error("Error sending message:", error.message);

        if (error.message === "Chat not found") {
            return res.status(404).json({ error: "Chat not found" });
        }
        if (error.message === "Users not found") {
            return res.status(404).json({ error: "One or both users not found" });
        }
        if (error.message === "User not in chat") {
            return res.status(403).json({ error: "User is not part of this chat" });
        }

        return res.status(500).json({ error: 'Unexpected error sending message' });
    }
}

export async function getPeopleWithWhomUserChatted(req: Request, res: Response): Promise<Response> {
    console.log("getting users with whom user chatted, user is: ");
    try {
        const userId = req.params.userId;
        const people = await chatService.getPeopleWithWhomUserChatted(userId);
        if (people.length === 0) {
            return res.status(404).json({ error: "No people found" });
        }
        return res.status(200).json({people: people});
    } catch (error: any) {
        console.error("Error getting people:", error.message);

        if (error.message === "User not found") {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(500).json({ error: 'Unexpected error getting people' });
    }
}

export async function getChat(req: Request, res: Response): Promise<Response> {
    try {
        const { user1ID, user2ID } = req.params;
        const chat = await chatService.getChat(user1ID, user2ID);
        return res.status(200).json(chat);
    } catch (error: any) {
        console.error("Error getting chat:", error.message);

        if (error.message === "Users not found") {
            return res.status(404).json({ error: "One or both users not found" });
        }
        if (error.message === "Chat not found") {
            return res.status(404).json({ error: "Chat not found" });
        }

        return res.status(500).json({ error: 'Unexpected error getting chat' });
    }
}

export async function getChatId(req: Request, res: Response): Promise<Response> {
    try {
        console.log("getting chat id ");
        const { user1ID, user2ID } = req.params;
        const chat = await chatService.getChatId(user1ID, user2ID);
        console.log("success");
        return res.status(200).json(chat);
    } catch (error: any) {
        console.error("Error getting chat Id:", error.message);

        if (error.message === "Users not found") {
            return res.status(404).json({ error: "One or both users not found" });
        }
        if (error.message === "Chat not found") {
            return res.status(404).json({ error: "Chat not found" });
        }

        return res.status(500).json({ error: 'Unexpected error getting chat ID' });
    }
}

export async function createChat(req: Request, res: Response): Promise<Response> {
    console.log("1");
    try {
        const { user1ID, user2ID, typeOfUser1, typeOfUser2 } = req.body;
        console.log("2");
        const newChat = await chatService.createChat(user1ID,typeOfUser1, user2ID, typeOfUser2);
        return res.status(201).json({
            message: "Chat created",
            chat: newChat
        });
    } catch (error: any) {
        console.error("Error creating chat:", error.message);

        if (error.message === "Chat already exists") {
            return res.status(409).json({ error: "Chat already exists" });
        }

        return res.status(500).json({ error: 'Unexpected error creating chat' });
    }
}

export async function getLast20Messages(req: Request, res: Response): Promise<Response> {
    console.log("getting the last 20 messages of chat ");
    try {
        const { chatId } = req.params;
        console.log("Chat ID:", chatId); // Log the chatId for debugging
        const messages = await chatService.getLast20MessagesOfChat(chatId);
        return res.status(200).json(messages);
    } catch (error: any) {
        console.error("Error getting last 20 messages:", error.message);

        if (error.message === "Chat not found") {
            return res.status(404).json({ error: "Chat not found" });
        }

        return res.status(500).json({ error: 'Unexpected error getting messages' });
    }
}

export async function getPeopleWithWhomWorkerChatted(req: Request, res: Response): Promise<Response> {
    try {
        const workerId = req.params.workerId;
        console.log("getting people with whom worker chatted, worker ID is: ", workerId);
        const people = await chatService.getPeopleWithWhomWorkerChatted(workerId);
        if (people.length === 0) {
            return res.status(404).json({ error: "No people found" });
        }
        return res.status(200).json({people: people});
    } catch (error: any) {
        if (error.message) {
            return res.status(404).json({ error: error.message });
        }

        return res.status(500).json({ error: 'Unexpected error getting people' });
    }
}

export async function editChat(req: Request, res: Response): Promise<Response> {
    try {
        const chatId = req.params.chatId;
        const changes = req.body as Partial<IChat>;
        
        const chat = await chatService.editChat(chatId, changes);
        if (!chat) return res.status(404).json({error: "Chat not found"});
        return res.status(200).json(chat);
    } catch (error) {
        return res.status(500).json({error: error});
    }
}

export async function deleteChat(req: Request, res: Response): Promise<Response> {
    try {
        const id = req.params.chatId;
        const deleted = await chatService.deleteChat(id);
        if (deleted) {
            return res.status(200).json();
        } else {
            return res.status(404).json({error: "chat not found"});
        }
    } catch (error) {
        return res.status(500).json({error: error});
    }
}
