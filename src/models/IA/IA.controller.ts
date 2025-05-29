import { Request, Response } from 'express';
import { IAService } from './IA.services';

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

export async function testGettingAllAppointmentsOfUserByDataFromIA(req: Request, res: Response): Promise<Response> {
    const userId = req.body.userId;
    const requests: [Date, string[]][] = req.body.requests;
    console.log("Testing getting all appointments of user by date from IA for user ID:", userId);
    try {
        const answer = await IaService.getOptimizedSchedule(requests,userId);
        if (!answer) {
            return res.status(404).json({ error: 'No appointments found' });
        }
        return res.status(200).json(answer);
    } catch (error: any) {
        console.error("Error getting appointments:", error.message);
        return res.status(500).json({ error: 'Unexpected error getting appointments' });
    }
}
