import { Request, Response } from 'express';
import { ICalendar } from './calendar.model';
import { CalendarService } from './calendar.services';
import {IAppointment} from '../appointment/appointment.model'

const calendarService = new CalendarService();

export async function createCalendar(req: Request, res: Response): Promise<Response> {
    try {
        console.log("Creating calendar");
        const calendar: Partial<ICalendar> = req.body;
        const answer = await calendarService.createCalendar(calendar);

        if (answer === null) {
            console.log("User not found");
            return res.status(404).json({
                message: "User not found"
            });
        } else if (answer === true) {
            console.log("The user already has a calendar");
            return res.status(405).json({
                message: "The user already has a calendar"
            });
        } else {
            console.log("Calendar created");
            return res.status(201).json({
                message: "Calendar created",
                calendar: answer
            });
        }
    } catch (error) {
        console.log("Server Error");
        return res.status(500).json({
            message: "Server Error"
        });
    }
}

export async function getAppointmentsForADay(req: Request, res: Response): Promise<Response> {
    try {
        console.log("Finding appointments for a day");
        const { name, date1 } = req.params;
        const date = new Date(date1);

        // Llamar al servicio
        const answer = await calendarService.getAppointmentsForADay(date, name);

        // Manejar la respuesta del servicio
        if (answer === true) {
            console.log("User not found");
            return res.status(404).json({
                message: "User not found"
            });
        } else if (answer === false) {
            console.log("The user has no calendar");
            return res.status(405).json({
                message: "The user has no calendar"
            });
        } else {
            console.log("Appointments obtained");
            return res.status(200).json({
                message: "Appointments obtained",
                appointments: answer
            });
        }
    } catch (error) {
        console.log("Server Error");
        return res.status(500).json({
            message: "Server Error"
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

export async function addAppointmentToCalendar(req: Request, res: Response): Promise<Response> {
    try {
        console.log("Adding an appointment to the calendar of a user");
        const { name } = req.params;
        const appointment: Partial<IAppointment> = req.body;

        // Llamar al servicio
        const answer = await calendarService.addAppointmentToCalendar(name, appointment);

        // Manejar la respuesta del servicio
        if (answer === false) {
            console.log("User not found");
            return res.status(404).json({
                message: "User not found"
            });
        } else if (answer === true) {
            console.log("The user has no calendar");
            return res.status(405).json({
                message: "The user has no calendar"
            });
        } else {
            console.log("Appointment added to calendar");
            return res.status(201).json({
                message: "Appointment added to calendar",
                calendar: answer
            });
        }
    } catch (error) {
        console.log("Server Error");
        return res.status(500).json({
            message: "Server Error"
        });
    }
}

export async function hardDeleteCalendarUser(req: Request, res: Response) {
    try {
        const { userName } = req.params;
        const deletedCalendar = await calendarService.hardDeleteCalendarUser(userName);

        if (deletedCalendar) {
            return res.status(200).json({
                message: "Calendar permanently deleted",
                calendar: deletedCalendar
            });
        } else {
            return res.status(404).json({ error: "Calendar or user not found" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Failed to delete calendar" });
    }
}

export async function softDeleteCalendarUser(req: Request, res: Response) {
    try {
        const { userName } = req.params;
        const softDeletedCalendar = await calendarService.softDeleteCalendarUser(userName);

        if (softDeletedCalendar) {
            return res.status(200).json({
                message: "Calendar soft deleted (marked as unavailable)",
                calendar: softDeletedCalendar
            });
        } else {
            return res.status(404).json({ error: "Calendar or user not found" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Failed to soft delete calendar" });
    }
}

export async function restoreCalendarUser(req: Request, res: Response) {
    try {
        const { userName } = req.params;
        const restoredCalendar = await calendarService.restoreCalendarUser(userName);

        if (restoredCalendar) {
            return res.status(200).json({
                message: "Calendar restored (marked as available)",
                calendar: restoredCalendar
            });
        } else {
            return res.status(404).json({ error: "Calendar or user not found" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Failed to restore calendar" });
    }
}