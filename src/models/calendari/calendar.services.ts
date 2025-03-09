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

    async getAllAppointments(userId: string): Promise<IAppointment[]> {
        const calendars = await Calendar.find({ owner: userId }).populate<{appointments: IAppointment[]}>({
            path: 'appointments'
        });
        
        const result: IAppointment[] = [];
        calendars.forEach(calendar => result.push(...calendar.appointments));
        return result;
    }
    
    async getAppointmentsBetweenDates(startDate: Date, endDate: Date, userId: string): Promise<IAppointment[]> {
        // Cerca calendaris de l'usuari
        const calendars = await Calendar.find({ owner: userId }).populate<{appointments: IAppointment[]}>({
            path: 'appointments',
            match: { inTime: { $gte: startDate, $lte: endDate } }
        });
        
        const result: IAppointment[] = [];
        calendars.forEach(calendar => result.push(...calendar.appointments));
        return result;
    }

    async getAppointmentsForADay(date: Date, userId: string): Promise<IAppointment[]> {
        // Obtener las citas para el día especificado
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        return await this.getAppointmentsBetweenDates(startOfDay, endOfDay, userId);
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

    async hardDeleteCalendarsUser(userId: string): Promise<number> {
        const result = await Calendar.deleteMany({ owner: userId });
        return result.deletedCount;
    }

    async softDeleteCalendarsUser(userId: string): Promise<number> {
        const result = await Calendar.updateMany(
            { owner: userId },
            { isDeleted: true },
        );
        return result.modifiedCount;
    }

    async restoreCalendarsUser(userId: string): Promise<number> {
        const result = await Calendar.updateMany(
            { owner: userId },
            { isDeleted: false },
        );
        return result.modifiedCount;
    }
}