import { Request, Response } from 'express';
import { IAService } from './IA.services';
import { IAppointment } from 'models/appointment/appointment.model';

const IaService = new IAService();

export async function TestConnection(req: Request, res: Response): Promise<Response> {
    console.log("Testing connection to chat service");
    const textToOptimize = req.body.textToOptimize as string;
    console.log("Text to optimize:", textToOptimize);
    try {
        return res.status(200).json({
            textOptimized: textToOptimize + " YES",
        });
    } catch (error: any) {
        console.error("Error testing connection:", error.message);
        return res.status(500).json({ error: 'Unexpected error testing connection' });
    }
}

export async function optimizeAppointments(req: Request, res: Response): Promise<Response> {
    const userId = req.body.userId;
    const textToOptimize = req.body.textToOptimize;
    console.log("Getting all appointments of user by date from IA for user ID:", userId);
    try {
        const formatedRequests: [Date, string[]][] = await IaService.getDayAndrequestsFromUserPetition(textToOptimize, userId)
        const answer:IAppointment[] = await IaService.getOptimizedSchedule(formatedRequests,userId);
        return res.status(200).json(answer);
    } catch (error: any) {
        if(error.message) return res.status(400).json({error: error.message});
        return res.status(500).json({ error: 'Unexpected error getting appointments' });
    }
}
