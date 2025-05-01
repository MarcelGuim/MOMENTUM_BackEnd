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
            console.log("Owner not found or invalid calendar name");
            return res.status(404).json({
                message: "Owner not found or invalid calendar name"
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
        const {calendarId } = req.params;

        const answer = await calendarService.getAllAppointments(calendarId);

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
        const { calendarId, d1, d2 } = req.params;
        const date1 = new Date(d1);
        const date2 = new Date(d2);

        const answer = await calendarService.getAppointmentsBetweenDates(date1, date2, calendarId);
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
        const { calendarId, date } = req.params;
        const date1 = new Date(date);

        // Llamar al servicio
        const answer = await calendarService.getAppointmentsForADay(date1, calendarId);

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
        console.log(appointment);
        console.log(calendarId);
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
        const { calendarId } = req.params;
        const numDeleted = await calendarService.hardDeleteCalendarsUser(calendarId);

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
        const { calendarId } = req.params;
        const calendar = await calendarService.softDeleteCalendarUser(calendarId);

        if (calendar !== null) {
            return res.status(200).json({
                message: "Calendars soft deleted (marked as unavailable)",
                calendar: calendar,
            });
        } else {
            return res.status(404).json({ error: "User had no calendar" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Failed to soft delete calendars" });
    }
}

export async function restoreCalendarsUser(req: Request, res: Response) {
    try {
        const { calendarId } = req.params;
        const calendar = await calendarService.restoreCalendarsUser(calendarId);

        if (calendar !== null) {
            return res.status(200).json({
                message: "Calendars restored (marked as available)",
                calendar: calendar,
            });
        } else {
            return res.status(404).json({ error: "User had no calendars" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to restore calendars" });
    }
}

export async function editCalendar(req: Request, res: Response) {
    try {
        const { calendarId } = req.params;
        const changes = req.body;

        const result = await calendarService.editCalendar(calendarId, changes);
        if (result == null) return res.status(404).json({ error: "Could not find calendar"});
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ error: "Failed to edit calendar" });
    }
}

export async function getCommonSlotsForTwoCalendars(req: Request, res: Response): Promise<Response> {
    try {
        console.log("Finding common slots between two calendars");
        
        const { date1, date2, user1Id, user2Id } = req.body;
        if (!date1 || !date2 || !user1Id || !user2Id) {
            return res.status(400).json({
                message: "All parameters are required in the request body"
            });
        }
        const startDate = new Date(date1);
        const endDate = new Date(date2);
        const result = await calendarService.getSlotsCommonForTwoUserCalendars(
            user1Id, 
            user2Id, 
            startDate, 
            endDate
        );
        if (result === 0) {
            return res.status(404).json({
                message: "One or both users not found"
            });
        } else if (result === 1) {
            return res.status(404).json({
                message: "One or both users have no calendars"
            });
        } else if (result === 4){
            return res.status(406).json({
                message: "User 1 has no empty slots in the given range"
            });
        } else if (result === 5) {
            return res.status(406).json({
                message: "User 2 has no empty slots in the given range"
            }); 
        } else if (result === null) {
            return res.status(404).json({
                message: "No common slots found"
            });
        } else {
            return res.status(200).json({
                message: "Common slots found",
                commonSlots: result
            });
        }
    } catch (error) {
        console.log("Server Error", error);
        return res.status(500).json({
            message: "Server Error"
        });
    }
}

export async function getCommonSlotsForNCalendars(req: Request, res: Response): Promise<Response> {
    try {
        console.log("Finding common slots between multiple calendars");
        
        const { userIds } = req.body;
        const { date1, date2 } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length < 2) {
            return res.status(400).json({
                message: "An array of at least 2 user IDs is required"
            });
        }

        if (!date1 || !date2) {
            return res.status(400).json({
                message: "Both date1 and date2 are required in the request body"
            });
        }
        const startDate = new Date(date1);
        const endDate = new Date(date2);
        const result = await calendarService.getSlotsCommonForCalendarsOfNUsers(
            userIds, 
            startDate, 
            endDate
        );

    
        if (Array.isArray(result)) {
            const [errorType, affectedUserIds] = result;
            
            if (errorType === 1) {
                return res.status(404).json({
                    message: "Some users were not found",
                    userIdsNotFound: affectedUserIds
                });
            } else if (errorType === 2) {
                return res.status(404).json({
                    message: "Some users have no calendars",
                    userIdsWithNoCalendars: affectedUserIds
                });
            } else if (errorType === 3) {
                return res.status(404).json({
                    message: "Some users have no empty slots in the given range",
                    userIdsWithNoEmptySlots: affectedUserIds
                });
            }
            else {
                console.log("Server Error");
                return res.status(500).json({
                    message: "Server Error"
                });
            }
        } else if (result === null) {
            return res.status(404).json({
                message: "No common slots found across all calendars"
            });
        } else {
            return res.status(201).json({
                message: "Common slots found across all calendars",
                commonSlots: result
            });
        }
    } catch (error) {
        console.log("Server Error", error);
        return res.status(500).json({
            message: "Server Error"
        });
    }
}

export async function setAppointmentRequestForWorker(req: Request, res: Response): Promise<Response> {
    try {
        console.log("Setting appointment request for worker");
        const { calendarId, workerId } = req.params;
        const { appointment } = req.body;

        const result = await calendarService.setAppointmentRequestForWorker(calendarId, workerId, appointment);
        return res.status(200).json({
            message: "Appointment request set for worker",
        });
    } catch (error) {
        if (error instanceof Error && error.message === "Calendar not found") {
            return res.status(404).json({ message: "Calendar not found" });
        }
        else if (error instanceof Error && error.message === "Worker not found") {
            return res.status(404).json({ message: "Worker not found" });
        }
        else if (error instanceof Error && error.message === "Slot already taken") {
            return res.status(404).json({ message: "Slot already taken" });
        }
        else{
            console.log("Server Error", error);
            return res.status(500).json({
                message: "Server Error"
            });
        }
    }
}

export async function getCommonSlotsForOneUserAndOneWorker(req:Request, res:Response): Promise<Response>{
    try{
        console.log("Finding common slots between a user and a worker");
        const { date1, date2, userId, workerId } = req.body;

        if (!date1 || !date2) {
            return res.status(400).json({
                message: "Both date1 and date2 are required in the request body"
            });
        }
        const startDate = new Date(date1);
        const endDate = new Date(date2);
        const result = await calendarService.getSlotsCommonForCalendarsOfOneUserAndOneWorker(
            userId,
            workerId,
            startDate,
            endDate
        );
        if (result === 0) {
            return res.status(404).json({
                message: "User or worker not found"
            });
        } else if (result === 1) {
            return res.status(404).json({
                message: "User or Worker have no calendars"
            });
        } else if (result === 4) {
            return res.status(406).json({
                message: "User has no empty slots in the given range"
            });
        }else if (result === 5) {
            return res.status(406).json({
                message: "Worker has no empty slots in the given range"
            }); 
        }else if (result === null) {
            return res.status(404).json({
                message: "No common slots found"
            });
        } else {
            return res.status(200).json({
                message: "Common slots found",
                commonSlots: result
            });
        }
    } catch(error){
        console.log("Server Error", error);
        return res.status(500).json({
            message: "Server Error"
        });
    }
}

export async function getCommonSlotsForOneUserAndOneLocation(req:Request, res:Response): Promise<Response>{
    try{
        console.log("Finding common slots between a user and a location");
        const { date1, date2, userId, locationId } = req.body;

        if (!date1 || !date2) {
            return res.status(400).json({
                message: "Both date1 and date2 are required in the request body"
            });
        }
        const startDate = new Date(date1);
        const endDate = new Date(date2);
        const result = await calendarService.getSlotsCommonForCalendarsOfOneUserAndOneLocation(
            userId,
            locationId,
            startDate,
            endDate
        );
        console.log("FINAL");
        console.log(result);
        if (result === 0) {
            return res.status(404).json({
                message: "User or Location not found"
            });
        } else if (result === 1) {
            return res.status(404).json({
                message: "Locations workers not found"
            });
        } else if (result === 2) {
            return res.status(404).json({
                message: "Location has no workers"
            });
        }else if (result === null) {
            return res.status(404).json({
                message: "No common slots found"
            });
        } else {
            return res.status(200).json({
                message: "Common slots found",
                commonSlots: result
            });
        }
    } catch(error){
        console.log("Server Error", error);
        return res.status(500).json({
            message: "Server Error"
        });
    }
}

