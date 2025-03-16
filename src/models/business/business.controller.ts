import { Request, Response } from 'express';
import { IBusiness } from './business.model';
//import { BusinessService } from './business.services';
import {IAppointment} from '../appointment/appointment.model'

//const businessService = new BusinessService();
/*
export async function createBusiness(req: Request, res: Response): Promise<Response> {
    try {
        console.log("Creating a business");
        const business: Partial<IBusiness> = req.body;
        const answer = await businessService.createBusiness(business);
        
    } catch (error) {
        console.log("Server Error");
        return res.status(500).json({
            message: "Server Error"
        });
    }
   
}
     */