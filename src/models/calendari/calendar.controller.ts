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
            console.log("User not found or invalid calendar name");
            return res.status(404).json({
                message: "User not found or invalid calendar name"
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

export async function getAllAppointments(req: Request, res: Response): Promise<Response> {
    try {
        console.log("Finding all appointments")
        const { userId } = req.params;

        const answer = await calendarService.getAllAppointments(userId);

        return res.status(200).json({
            message: "Appointments obtained",
            appointments: answer,
        })
    } catch (error) {
        console.log("Server Error");
        return res.status(500).json({
            message: "Server Error"
        });
    }
}

export async function getAppointmentsBetweenDates(req: Request, res: Response): Promise<Response> {
    try {
        console.log("Finding appointments between two dates");
        const { userId, d1, d2 } = req.params;
        const date1 = new Date(d1);
        const date2 = new Date(d2);

        const answer = await calendarService.getAppointmentsBetweenDates(date1, date2, userId);
        return res.status(200).json({
            message: "Appointments obtained",
            appointments: answer,
        })
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
        const { userId, date } = req.params;
        const date1 = new Date(date);

        // Llamar al servicio
        const answer = await calendarService.getAppointmentsForADay(date1, userId);

        console.log("Appointments obtained");
        return res.status(200).json({
            message: "Appointments obtained",
            appointments: answer
        });
    } catch (error) {
        console.log("Server Error");
        return res.status(500).json({
            message: "Server Error"
        });
    }
}

export async function getCalendarsOfUser(req:Request, res:Response): Promise<Response>{
    try{
        console.log("Finding the calendars of a user");
        const { userId } = req.params;
        const answer = await calendarService.getCalendarsOfUser(userId);

        console.log("Calendar obtained");
        return res.status(200).json({
            message:"Calendar obtained",
            calendars: answer
        });
    } catch(error){
        console.log("Server Error")
        return res.status(500).json({
            message:"Server Error"
        });
    }
}

export async function addAppointmentToCalendar(req: Request, res: Response): Promise<Response> {
    try {
        console.log("Adding an appointment to the calendar of a user");
        const { calendarId } = req.params;
        const appointment: Partial<IAppointment> = req.body;

        // Llamar al servicio
        const answer = await calendarService.addAppointmentToCalendar(calendarId, appointment);

        // Manejar la respuesta del servicio
        if (answer === null) {
            console.log("Calendar not found");
            return res.status(404).json({
                message: "Calendar not found"
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

export async function hardDeleteCalendarsUser(req: Request, res: Response) {
    try {
        const { userId } = req.params;
        const numDeleted = await calendarService.hardDeleteCalendarsUser(userId);

        if (numDeleted > 0) {
            return res.status(200).json({
                message: "Calendars permanently deleted",
                numDeleted: numDeleted,
            });
        } else {
            return res.status(404).json({ error: "User had no calendars" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Failed to delete calendar" });
    }
}

export async function softDeleteCalendarsUser(req: Request, res: Response) {
    try {
        const { userId } = req.params;
        const numDeleted = await calendarService.softDeleteCalendarsUser(userId);

        if (numDeleted > 0) {
            return res.status(200).json({
                message: "Calendars soft deleted (marked as unavailable)",
                numDeleted: numDeleted,
            });
        } else {
            return res.status(404).json({ error: "User had no calendars" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Failed to soft delete calendars" });
    }
}

export async function restoreCalendarsUser(req: Request, res: Response) {
    try {
        const { userId } = req.params;
        const numRestored = await calendarService.restoreCalendarsUser(userId);

        if (numRestored > 0) {
            return res.status(200).json({
                message: "Calendars restored (marked as available)",
                numRestored: numRestored,
            });
        } else {
            return res.status(404).json({ error: "User had no calendars" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Failed to restore calendars" });
    }
}