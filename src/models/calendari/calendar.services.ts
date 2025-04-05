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
        const result = await Calendar.deleteMany({ _id: calendarId });
        return result.deletedCount;
    }

    async softDeleteCalendarsUser(calendarId: string): Promise<ICalendar | null> {
        const result = await Calendar.findOneAndUpdate(
            { _id: calendarId },
            { isDeleted: true },
            { new: true }
        );
        return result;
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

    async getEmptySlotForAUser(userId: string): Promise<[Date,Date][] | null> {
        const user = await User.findById(userId);
        if (user?._id) {
            const calendar = await Calendar.find({owner: user._id});
            if (calendar === null) return null;
            let appointments: IAppointment[] = [];
            for(let i = 0; i < calendar.length; i++){
                const populatedCalendar = await calendar[i].populate('appointments');
                const calendarAppointments = populatedCalendar.appointments as unknown as IAppointment[]
                appointments.push(...calendarAppointments);
            }
            appointments.sort((a, b) => a.inTime.getTime() - b.inTime.getTime());
            let slots:[Date,Date][] = [];
            const startOfDay = new Date(appointments[0].inTime.getTime());
            startOfDay.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(appointments[appointments.length - 1].outTime.getTime());
            endOfDay.setUTCHours(23, 59, 59, 999);
            slots.push([startOfDay, appointments[0].inTime]);
            for (let i = 0; i < appointments.length - 1; i++){
                slots.push([appointments[i].outTime, appointments[i+1].inTime])
            }
            slots.push([appointments[appointments.length -1 ].outTime, endOfDay]);
            console.log(slots);
            return slots;
        }
        else return null;
    }

    async getSlotsCommonForTwoCalnedars(user1Id: string, user2Id: string, date1: Date, date2: Date): Promise<Date | null | boolean> {
        const user1: IUsuari | null = await User.findById(user1Id);
        const user2: IUsuari | null = await User.findById(user2Id);
        if (!user1 || !user2) return false;
        const calendarUser1: ICalendar[] = await Calendar.find({owner: user1Id});
        const calendarUser2: ICalendar[] = await Calendar.find({owner: user2Id});
        console.log(calendarUser1);
        console.log(calendarUser2);
        if (!calendarUser1 || !calendarUser2) return true;
        const namesCalendar1 = calendarUser1.map(element => element.calendarName);
        const namesCalendar2 = calendarUser2.map(element => element.calendarName);
        console.log("Calendars for user1: " + user1.name + " has calendars: " + namesCalendar1);
        console.log("Calendars for user2: " + user2.name + " has calendars: " + namesCalendar2);
        if(user1._id) this.getEmptySlotForAUser(user1._id.toString());
        return null;
    }
}