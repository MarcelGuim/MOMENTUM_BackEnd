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
}