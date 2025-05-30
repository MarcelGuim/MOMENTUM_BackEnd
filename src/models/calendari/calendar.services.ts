import { promises } from 'dns';
import Calendar, {ICalendar} from './calendar.model';
import User, {IUsuari} from '../users/user.model';
import Appointment, { IAppointment } from '../appointment/appointment.model';
import { start } from 'repl';
import Worker, { IWorker } from '../worker/worker.model';
import { appointmentState } from '../../enums/appointmentState.enum';
import Location, { ILocation } from '../location/location.model';
import { LocationService } from '../location/location.services';
import Bussiness, { IBusiness } from '../business/business.model';
import { BusinessService } from '../business/business.services';
import mongoose from 'mongoose';

export class CalendarService {
    private locationService = new LocationService();
    private bussinessService = new BusinessService();

    async createCalendar(data: Partial<ICalendar>): Promise<ICalendar | null> {
        // Verificar si el usuario existe
        const user = await User.findById(data.owner);
        const worker = await Worker.findById(data.owner);
        if (!user && !worker) {
            return null; // Owner no encontrado
        }

        // Verificar que el nom del calendari sigui vàlid:
        if(!data.calendarName) return null;

        // Crear el calendari
        const calendar = new Calendar(data);
        return await calendar.save(); // Devuelve el calendario creado
    }

    async getAllAppointments(calendarId: string): Promise<IAppointment[]> {
        const calendar = await Calendar.findById(calendarId).populate<{appointments: IAppointment[]}>({
            path: 'appointments',
            match: { isDeleted: false},
        });
        
        if (!calendar) return []

        return calendar.appointments.map(appointment => ({
            ...(appointment as any)._doc,
            calendarId: calendar._id
        }));
    }
    
    async getAppointmentsBetweenDates(startDate: Date, endDate: Date, calendarId: string): Promise<IAppointment[]> {
        // Cerca calendaris de l'usuari
        const calendar = await Calendar.findById(calendarId).populate<{appointments: IAppointment[]}>({
            path: 'appointments',
            match: { inTime: { $gte: startDate, $lte: endDate }, isDeleted: false }
        });

        if (!calendar) return [];
        
        return calendar.appointments.map(appointment => ({
            ...(appointment as any)._doc,
            calendarId: calendar._id
        }));
    }

    async getAppointmentsForADay(date: Date, calendarId: string): Promise<IAppointment[]> {
        const date1 = new Date(date);
        const startOfDay = new Date(date1.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date1.setHours(23, 59, 59, 999));

        return await this.getAppointmentsBetweenDates(startOfDay, endOfDay, calendarId);
    }

    async getCalendarsOfUser(userId: string): Promise<ICalendar[]>{
        return await Calendar.find({ owner: userId })
    }

    async addAppointmentToCalendar(calendarId: string, appointment: Partial<IAppointment>): Promise<ICalendar | null> {
        // Verificar si existeix el calendari
        const calendar = await Calendar.findById(calendarId);
        if (!calendar) {
            return null; // El calendari no existeix
        }
        // Guardar la cita
        const appointmentSaved = await new Appointment(appointment).save();
        // Actualizar el calendario con la nueva cita
        return await calendar.updateOne(
            { $push: { appointments: appointmentSaved._id } },
            { new: true },
        );
    }

    async hardDeleteAppointment(appointmentId: string): Promise<number | null> {
        const res = await Appointment.deleteMany({_id: new mongoose.Types.ObjectId(appointmentId)});
        if (!res) return null;
        return res.deletedCount;
    }

    async softDeleteAppointment(appointmentId: string): Promise<number | null> {
        const res = await Appointment.updateMany({_id: new mongoose.Types.ObjectId(appointmentId)}, { $set: {isDeleted: true}});
        if (!res) return null;
        return res.modifiedCount;
    }

    async hardDeleteCalendarsUser(calendarId: string): Promise<number> {
        // First get the calendar to find its appointments
        const calendar = await Calendar.findById(calendarId);
        
        if (!calendar) return 0;
    
        // Delete in parallel
        const [calendarResult] = await Promise.all([
            Calendar.deleteOne({ _id: calendarId }),
            // Only delete appointments if they exist
            ...(calendar.appointments.length > 0 ? [
                Appointment.deleteMany({ _id: { $in: calendar.appointments } })
            ] : [])
        ]);
    
        return calendarResult.deletedCount;
    }

    async softDeleteCalendarUser(calendarId: string): Promise<ICalendar | null> {
        // First get the calendar to find its appointments
        const calendar = await Calendar.findById(calendarId);
        
        if (!calendar) return null;
    
        // Perform updates in parallel
        const res = await Promise.all([
            Calendar.findByIdAndUpdate(
                calendarId,
                { $set: { isDeleted: true } }
            ),
            // Only update appointments if they exist
            ...(calendar.appointments.length > 0 ? [
                Appointment.updateMany(
                    { _id: { $in: calendar.appointments } },
                    { $set: { isDeleted: true } }
                )
            ] : [])
        ]);
    
        // Return the updated calendar
        return res[0];
    }

    async restoreCalendarsUser(calendarId: string): Promise<ICalendar | null> {
        const result = await Calendar.findOneAndUpdate(
            { _id: calendarId },
            { isDeleted: false },
            { new: true }
        );
        return result;
    }

    async editCalendar(calendarId: string, changes: Partial<ICalendar>): Promise<ICalendar | null> {
        const result = await Calendar.findByIdAndUpdate(calendarId, changes, {new: true});
        return result;
    }

    async getEmptySlotForAUser(userId: string, date1: Date, date2: Date): Promise<[Date,Date][] | null> {
        const user = await User.findById(userId);
        if (user?._id) {
            const calendar = await Calendar.find({owner: user._id});
            if (calendar.length === 0) return null;
            let appointments: IAppointment[] = [];
            const populatedCalendars = await Promise.all(
                calendar.map(cal => cal.populate('appointments'))
            );
            populatedCalendars.forEach(populatedCalendar => {
                const calendarAppointments = populatedCalendar.appointments as unknown as IAppointment[];
                appointments.push(...calendarAppointments);
            });
            appointments.sort((a, b) => a.inTime.getTime() - b.inTime.getTime());
            const appointmentsInRange: IAppointment[] = appointments.filter(appointment =>
                appointment.inTime >= date1 && appointment.outTime <= date2
            );
            if(appointmentsInRange.length === 0) return [[date1, date2]];
            appointmentsInRange.sort((a, b) => a.inTime.getTime() - b.inTime.getTime());
            let slots:[Date,Date][] = [];
            const startOfPeriod = new Date(date1);
            const endOfPeriod = new Date(date2);
            slots.push([startOfPeriod, appointmentsInRange[0].inTime]);
            appointmentsInRange.forEach((appointmentsInRange1, i) => {
                if (i < appointmentsInRange.length - 1) {
                    slots.push([appointmentsInRange1.outTime, appointmentsInRange[i + 1].inTime]);
                }
            });
            slots.push([appointmentsInRange[appointmentsInRange.length -1 ].outTime, endOfPeriod]);
            return slots;
        }
        else return null;
    }

    async getEmptySlotForAWorker(workerId: string, date1: Date, date2: Date): Promise<[Date,Date][] | null> {
        const worker = await Worker.findById(workerId);
        if (worker?._id) {
            const calendar = await Calendar.find({owner: worker._id});
            if (calendar.length === 0) return null;
            let appointments: IAppointment[] = [];
            const populatedCalendars = await Promise.all(
                calendar.map(cal => cal.populate('appointments'))
            );
            populatedCalendars.forEach(populatedCalendar => {
                const calendarAppointments = populatedCalendar.appointments as unknown as IAppointment[];
                appointments.push(...calendarAppointments);
            });
            appointments.sort((a, b) => a.inTime.getTime() - b.inTime.getTime());
            const appointmentsInRange: IAppointment[] = appointments.filter(appointment =>
                appointment.inTime >= date1 && appointment.outTime <= date2
            );
            if(appointmentsInRange.length === 0) return [[date1, date2]];
            appointmentsInRange.sort((a, b) => a.inTime.getTime() - b.inTime.getTime());
            let slots:[Date,Date][] = [];
            const startOfPeriod = new Date(date1);
            const endOfPeriod = new Date(date2);
            slots.push([startOfPeriod, appointmentsInRange[0].inTime]);
            appointmentsInRange.forEach((appointmentsInRange1, i) => {
                if (i < appointmentsInRange.length - 1) {
                    slots.push([appointmentsInRange1.outTime, appointmentsInRange[i + 1].inTime]);
                }
            });
            slots.push([appointmentsInRange[appointmentsInRange.length -1 ].outTime, endOfPeriod]);
            return slots;
        }
        else return null;
    }

    async getMatchingDatesForTwoEmptySlotsArrays(array1: [Date, Date][],array2: [Date, Date][]): Promise<[Date, Date][]> {
        const result: [Date, Date][] = [];
        
        for (const item1 of array1) {
            for (const item2 of array2) {
                const start = new Date(Math.max(item1[0].getTime(), item2[0].getTime()));
                const end = new Date(Math.min(item1[1].getTime(), item2[1].getTime()));
                
                if (start < end) {
                    result.push([start, end]);
                }
            }
        }
        if (result.length === 0) throw new Error("No matching dates found");
        return result;
    }
  
    async getMachingDatesForNEmptySoltsArrays(arrays: [Date, Date][][]): Promise<[Date, Date][] | null> {
        let result: [Date, Date][] | null = arrays[0];
            for (let array of arrays) {
                result = await this.getMatchingDatesForTwoEmptySlotsArrays(result as [Date, Date][], array);
            }
        return result;
    }

    async getSlotsCommonForTwoUserCalendars(user1Id: string, user2Id: string, date1: Date, date2: Date): Promise<[Date,Date][] | null | number> {
        const user1: IUsuari | null = await User.findById(user1Id);
        const user2: IUsuari | null = await User.findById(user2Id);
        if (!user1 || !user2) return 0;
        let emptySlotsUser1: [Date, Date][] | null = null;
        let emptySlotsUser2: [Date, Date][] | null = null;

        if (user1._id && user2._id) {
            emptySlotsUser1 = await this.getEmptySlotForAUser(user1._id.toString(), date1, date2);
            emptySlotsUser2 = await this.getEmptySlotForAUser(user2._id.toString(), date1, date2);
            if ( emptySlotsUser1 == null ||emptySlotsUser2 == null) return 1; 
            else if (emptySlotsUser1.length === 0) return 4;
            else if (emptySlotsUser2.length === 0) return 5;
            return await this.getMatchingDatesForTwoEmptySlotsArrays(emptySlotsUser1, emptySlotsUser2);
        } 
        return null;
    }

    async getSlotsCommonForCalendarsOfNUsers(userIDs: string[], date1: Date, date2: Date): Promise<[Date,Date][] | null | number | [number,string[]]> {
        let userIDsNotFound: [number, string[]] = [1, []];
        await Promise.all(userIDs.map(async (userId) => { 
            const user: IUsuari | null = await User.findById(userId); 
            if (!user) userIDsNotFound[1].push(userId);
        }));
        
        if (userIDsNotFound[1].length > 0) {
            return userIDsNotFound;
        }
        let emptySlots: [Date, Date][][] = [];
        let userIDsWithNoCalendars: [number, string[]] = [2, []];
        let userIDsWithNoEmptySlots: [number, string[]] = [3, []];
        
        await Promise.all(userIDs.map(async (userId) => {
            let item: [Date, Date][] | null | number = await this.getEmptySlotForAUser(userId, date1, date2);
            if (!item){
                console.log(`User with ID ${userId} has no calendars`);
                userIDsWithNoCalendars[1].push(userId);
            }else if (typeof item === 'number') {
                console.log(`User with ID ${userId} has no empty slots ${item}`);
                userIDsWithNoEmptySlots[1].push(userId);
            } else {
                emptySlots.push(item);
            }
        }));
        if (userIDsWithNoCalendars[1].length > 0) {
            return userIDsWithNoCalendars;
        } else if (userIDsWithNoEmptySlots[1].length > 0) {
            return userIDsWithNoEmptySlots;
        }
        return await this.getMachingDatesForNEmptySoltsArrays(emptySlots);
    }

    async logDatesInISOFormat(dates: [Date, Date][], message: string): Promise<void> {
        let datesInISO: [string, string][] = dates.map(date => [date[0].toISOString(), date[1].toISOString()]);
        console.log(message,datesInISO);
    }

    async setAppointmentRequestForWorker(userCalendarId:string, workerId: string, appointment: IAppointment): Promise<Boolean> {      
        const calendarsWorker = await Calendar.find({ owner: workerId });
        const calendarUser = await Calendar.findById(userCalendarId);
        await Promise.all(
            calendarsWorker.map(async (calendar) => {
                let result = await this.getAppointmentsBetweenDates(appointment.inTime, appointment.outTime, calendar._id.toString());
                if (result.length !== 0) throw new Error("Slot already taken");
            })
        );
        let result = await this.getAppointmentsBetweenDates(appointment.inTime, appointment.outTime, calendarUser?.id.toString());
        if(result.length !== 0) throw new Error("Slot already taken");
        if (appointment.appointmentState !== appointmentState.REQUESTED) appointment.appointmentState = appointmentState.REQUESTED;
        const appointmentSaved = await new Appointment(appointment).save();
        this.addAppointmentToCalendar(userCalendarId, appointmentSaved);
        this.addAppointmentToCalendar(calendarsWorker[0]._id.toString(), appointmentSaved);
        return true;   
    }

    async getSlotsCommonForCalendarsOfOneUserAndOneWorker(userId: string, workerId: string, date1: Date, date2: Date): Promise<[Date,Date][] | null> {
        const user: IUsuari | null = await User.findById(userId);
        const worker: IWorker | null = await Worker.findById(workerId);
        if (!user || !worker) throw new Error("Error finding the user or the bussiness");
        let emptySlotsUser: [Date, Date][] | null = null;
        let emptySlotsWorker: [Date, Date][] | null = null;

        if (user._id && worker._id) {
            emptySlotsUser = await this.getEmptySlotForAUser(user._id.toString(), date1, date2);
            emptySlotsWorker = await this.getEmptySlotForAWorker(worker._id.toString(), date1, date2);
            if ( emptySlotsUser === null ||emptySlotsWorker === null) throw new Error("Error finding the empty slots, one of the people involved might not have a calendar"); 
            else if (emptySlotsUser.length === 0) throw new Error("Error, there are no empty slots for the user");
            else if (emptySlotsWorker.length === 0) throw new Error("Error, there are no empty slots for the worker");
            return await this.getMatchingDatesForTwoEmptySlotsArrays(emptySlotsUser, emptySlotsWorker);
        } 
        return null;
    }

    async getSlotsCommonForCalendarsOfOneUserAndOneLocation(userId: string, locationId: string, date1: Date, date2: Date): Promise<[String,[Date,Date][]][]> {
        const user: IUsuari | null = await User.findById(userId);
        const location: ILocation | null = await Location.findById(locationId);
        if (!user || !location) throw new Error("Error finding the user or the bussiness");
        const workers: IWorker[] | null = await this.locationService.getWorkersOfLocation(locationId);
        if (!workers) throw new Error("Error finding the workers of the location");
        if (workers.length === 0) throw new Error("Error, there are no workers at that location");
        let finalResult: [String, [Date, Date][]][] = [];
            if (user._id && location._id) {
                for (const worker of workers) {
                    if (worker._id) {
                        try{
                            const result = await this.getSlotsCommonForCalendarsOfOneUserAndOneWorker(
                                userId,
                                worker._id.toString(),
                                date1,
                                date2
                            );
                            if (result !== null) {
                                finalResult.push([worker._id.toString(), result as [Date, Date][]]);
                            }
                        } catch (error) {}
                    }
                }
            }  
        if (finalResult.length === 0) throw new Error("No slots found"); 
        return finalResult;
    }

    async getSlotsCommonForCalendarsOfOneUserAndOneBussiness(serviceType: string, userId: string, bussinessId: string, date1: Date, date2: Date): Promise<[String, [String,[Date,Date][]][]][]> {
        const user: IUsuari | null = await User.findById(userId);
        const bussiness: IBusiness | null = await Bussiness.findById(bussinessId);
        let finalResult: [String,[String, [Date, Date][]][]][] = [];
        if (!user || !bussiness) throw new Error("Error finding the user or the bussiness");
        const locations: ILocation[] | null | number= await this.bussinessService.getAllLocationsFromBusinessbyServiceType(bussinessId,serviceType);
        if (!locations) throw new Error("Error finding the locations");
        else if (typeof locations === 'number'){
            if (locations === -1) throw new Error("Error in the bussiness Id");
            else if (locations === -2) throw new Error("Error in the service type");
            else if (locations === -3) throw new Error("There are no locations for this service type in the bussiness");
        }
        else{
            if (user._id && bussiness._id) {
                for (const location of locations) {
                    if (location._id) {
                        try{
                            const result = await this.getSlotsCommonForCalendarsOfOneUserAndOneLocation(
                                userId,
                                location._id.toString(),
                                date1,
                                date2
                            );
                            if (result !== null) {
                                finalResult.push([location._id.toString(), result as [String,[Date, Date][]][]]);
                            }
                        }
                        catch (error) {}
                    }
                }
            }   
        }
        if(finalResult.length === 0) throw new Error("No slots found");
        return finalResult;
    }

    async acceptRequestedAppointment(appointmentId: string): Promise<boolean|IAppointment>{
        const appointment:IAppointment | null = await Appointment.findById(appointmentId);
        if (!appointment) throw new Error("Appointment not found");
        if (appointment.appointmentState != appointmentState.STANDBY && appointment.appointmentState != appointmentState.REQUESTED) throw new Error("Appointment can't be accepted, it already is");
        const answer:IAppointment|null = await Appointment.findByIdAndUpdate(appointmentId, {appointmentState: "accepted"}, {new: true});
        if(!answer) return false;
        return answer;
    }

    async acceptStandByAppointment(appointment: IAppointment, userId: string): Promise<boolean|IAppointment>{
        const user: IUsuari | null = await User.findById(userId);
        if(!user) throw new Error("User not found");
        const calendar: ICalendar | null = await Calendar.findOne({owner:user._id});
        if (!calendar) throw new Error("Calendar not found");
        appointment.appointmentState = appointmentState.ACCEPTED;
        appointment.colour = calendar.defaultColour;
        if(appointment.colour == undefined) delete appointment.colour;
        const newAppointment = new Appointment(appointment);
        const answer:IAppointment | null = await newAppointment.save();
        if (!answer) throw new Error("Appointment not saved correctly");
        await Calendar.findByIdAndUpdate(
            calendar._id,
            { $push: { appointments: answer._id } },
            { new: true }
        );
        return answer;
    }
}