import { promises } from 'dns';
import Calendar, {ICalendar} from './calendar.model';
import User, {IUsuari} from '../users/user.model';
import Appointment, { IAppointment } from '../appointment/appointment.model';
import { start } from 'repl';


export class CalendarService {
    async createCalendar(data: Partial<ICalendar>): Promise<ICalendar | null> {
        // Verificar si el usuario existe
        const user = await User.findById(data.owner);
        if (!user) {
            return null; // Usuario no encontrado
        }

        // Verificar que el nom del calendari sigui vàlid:
        if(!data.calendarName) return null;

        // Crear el calendari
        const calendar = new Calendar(data);
        return await calendar.save(); // Devuelve el calendario creado
    }

    async getAllAppointments(calendarId: string): Promise<IAppointment[]> {
        const calendars = await Calendar.find({_id: calendarId}).populate<{appointments: IAppointment[]}>({
            path: 'appointments'
        });
        
        const result: IAppointment[] = [];
        calendars.forEach(calendar => result.push(...calendar.appointments));
        return result;
    }
    
    async getAppointmentsBetweenDates(startDate: Date, endDate: Date, calendarId: string): Promise<IAppointment[]> {
        // Cerca calendaris de l'usuari
        const calendars = await Calendar.find({ _id: calendarId }).populate<{appointments: IAppointment[]}>({
            path: 'appointments',
            match: { inTime: { $gte: startDate, $lte: endDate } }
        });
        
        const result: IAppointment[] = [];
        calendars.forEach(calendar => result.push(...calendar.appointments));
        return result;
    }

    async getAppointmentsForADay(date: Date, calendarId: string): Promise<IAppointment[]> {
        // Obtener las citas para el día especificado
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        return await this.getAppointmentsBetweenDates(startOfDay, endOfDay, calendarId);
    }

    async getCalendarsOfUser(userId: string): Promise<ICalendar[]>{
        return await Calendar.find({ owner: userId })
    }

    async addAppointmentToCalendar(calendarId: string, appointment: Partial<IAppointment>): Promise<ICalendar | null> {
        // Verificar si existeix el calendari
        const calendar = await Calendar.findOne({ _id: calendarId });
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
        await Promise.all([
            Calendar.updateOne(
                { _id: calendarId },
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
        return await Calendar.findById(calendarId);
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

    async getEmptySlotForAUser(userId: string, date1: Date, date2: Date): Promise<[Date,Date][] | null | number> {
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

  /*   async getMatchingDatesForTwoEmptySlotsArrays(array1: [Date,Date][], array2: [Date,Date][]): Promise<[Date,Date][] | null> {
        let result: [Date,Date][] = [];
        array1.forEach(item1 => {
            let found = false;
            array2.forEach(item2 => {
                if (!found){
                    if (item1[0].toISOString() >= item2[0].toISOString() && item1[1].toISOString() <= item2[1].toISOString()) {
                        result.push(item1); 
                        found = true;
                    }
                    else if (item2[0].toISOString() >= item1[0].toISOString() && item2[1].toISOString() <= item1[1].toISOString()) {
                        result.push(item2);
                        found = true;
                    }
                    else if (item1[0].toISOString() >= item2[0].toISOString() && item1[1].toISOString() >= item2[1].toISOString() && item1[0].toISOString() !== item2[1].toISOString() && item1[0].toISOString() < item2[1].toISOString()) {
                        result.push([item1[0], item2[1]]);
                        found = true;
                    }
                    else if (item2[0].toISOString() >= item1[0].toISOString() && item2[1].toISOString() >= item1[1].toISOString() && item2[0].toISOString() != item1[1].toISOString() && item2[0].toISOString() < item1[1].toISOString()){
                        result.push([item2[0], item1[1]]);
                        found = true;
                    }
                } else {}
            });
        });

        if (result.length > 0) return result;
        return null;
    } */ 

    async getMatchingDatesForTwoEmptySlotsArrays(array1: [Date, Date][],array2: [Date, Date][]): Promise<[Date, Date][] | null> {
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
        this.logDatesInISOFormat(result,"");
        return result.length > 0 ? result : null;
    }
  
    async getMachingDatesForNEmptySoltsArrays(arrays: [Date, Date][][]): Promise<[Date, Date][] | null> {
        let result: [Date, Date][] | null = arrays[0];
            for (let array of arrays) {
                result = await this.getMatchingDatesForTwoEmptySlotsArrays(result as [Date, Date][], array);
                this.logDatesInISOFormat(result as [Date,Date][],"")
            }
        return result;
    }

    async getSlotsCommonForTwoCalendars(user1Id: string, user2Id: string, date1: Date, date2: Date): Promise<[Date,Date][] | null | number> {
        const user1: IUsuari | null = await User.findById(user1Id);
        const user2: IUsuari | null = await User.findById(user2Id);
        if (!user1 || !user2) return 0;
        let emptySlotsUser1: [Date, Date][] | null | number = null;
        let emptySlotsUser2: [Date, Date][] | null | number = null;

        if (user1._id && user2._id) {
            emptySlotsUser1 = await this.getEmptySlotForAUser(user1._id.toString(), date1, date2);
            emptySlotsUser2 = await this.getEmptySlotForAUser(user2._id.toString(), date1, date2);
            if ( emptySlotsUser1 == null ||emptySlotsUser2 == null) return 1;
            else if (typeof emptySlotsUser1 === 'number') return 2;
            else if (typeof emptySlotsUser2 === 'number') return 3;     
            else if (emptySlotsUser1.length === 0) return 4;
            else if (emptySlotsUser2.length === 0) return 5;
            return await this.getMatchingDatesForTwoEmptySlotsArrays(emptySlotsUser1, emptySlotsUser2);
        } 
        return null;
    }

    async getSlotsCommonForNCalendars(userIDs: string[], date1: Date, date2: Date): Promise<[Date,Date][] | null | number | [number,string[]]> {
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
}