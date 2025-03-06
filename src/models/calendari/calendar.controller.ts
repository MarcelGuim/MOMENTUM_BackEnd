import { Request, Response } from 'express';
import { ICalendar } from './calendar.model';
import { CalendarService } from './calendar.services';
import {IAppointment} from '../appointment/appointment.model'

const calendarService = new CalendarService();

export async function createCalendar(req:Request, res:Response): Promise<Response>{
    try{
        console.log("Creating calendar");
        const calendar:Partial<ICalendar> = req.body;
        const answer = await calendarService.createCalendar(calendar);
        if(!answer){
            console.log("User not found");
            return res.status(404).json({
                message:"User not found"
            });
        }
        else if (answer){
            console.log("The user already has a calendar");
            return res.status(405).json({
                message:"The user already has a calendar"
            });
        }
        else{
            console.log("Calendar created");
            return res.status(201).json({
                message:"Calendar created",
                answer
            });
        }
    }
    catch(error){
        console.log("Server Error")
        return res.status(500).json({
            message:"Server Error"
        });
    }
}

export async function getAppointmentsForADay(req:Request, res:Response): Promise<Response>{
        //retorna true si no hi ha user amb aquell nom
        //retorna false si l'usuari no te calendari
        //retorna els appointments si tot ha anat bé
    try{
        console.log("Finding appointments for a day");
        const {name,date1} = req.params;
        const date = new Date(date1);        
        const answer = await calendarService.getAppointmentsForADay(date,name);
        if(!answer){
            console.log("The user has no calendar");
            return res.status(404).json({
                message:"The user has no calendar"
            });
        }
        else if (answer){
            console.log("User not found");
            return res.status(405).json({
                message:"User not found"
            });
        }
        else{
            console.log("Appointments obtained");
            return res.status(201).json({
                message:"Appointments obtained",
                answer
            });
        }
    }
    catch(error){
        console.log("Server Error")
        return res.status(500).json({
            message:"Server Error"
        });
    }
}

export async function getCalendarOfUser(req:Request, res:Response): Promise<Response>{
        //Retorna null si no te calendari
        //Retorna el calendari si tot ha anat bé
    try{
        console.log("Finding the calendar of a user");
        const {name} = req.params;
        const answer = await calendarService.getCalendarOfUser(name);
        if(answer === null){
            console.log("The user has no calendar");
            return res.status(404).json({
                message:"The user has no calendar"
            });
        }
        else{
            console.log("Calendar obtained");
            return res.status(201).json({
                message:"Calendar obtained",
                answer
            });
        }
    }
    catch(error){
        console.log("Server Error")
        return res.status(500).json({
            message:"Server Error"
        });
    }
}

export async function addAppointmentToCalendar(req:Request, res:Response): Promise<Response>{
    //retorna false si no existeix l'usuari, retorna true si no existeix el calendari
    //retorna el calendari actualitzat si ho ha fet bé.
    try{
        console.log("Adding an apointment to the calendar of a user");
        const {name} = req.params;
        const appointment:Partial<IAppointment> = req.body;
        const answer = await calendarService.addAppointmentToCalendar(name, appointment);
        if(answer){
            console.log("The user has no calendar");
            return res.status(404).json({
                message:"The user has no calendar"
            });
        }
        else if (!answer){
            console.log("User not found");
            return res.status(405).json({
                message:"User not found"
            });
        }
        else{
            console.log("Appointment updated");
            return res.status(201).json({
                message:"Appointment updated",
                answer
            });
        }
    }
    catch(error){
        console.log("Server Error")
        return res.status(500).json({
            message:"Server Error"
        });
    }
}