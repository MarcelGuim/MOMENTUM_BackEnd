import { promises } from 'dns';
import Calendar, {ICalendar} from './calendar.model';
import User, {IUsuari} from '../users/user.model';
import Appointment, { IAppointment } from '../appointment/appointment.model';
import { start } from 'repl';


export class CalendarService {
    async createCalendar(data: Partial<ICalendar>): Promise<ICalendar | null | boolean> {
        // Verificar si el usuario existe
        const user = await User.findById(data.user);
        if (!user) {
            return null; // Usuario no encontrado
        }
    
        // Verificar si el usuario ya tiene un calendario
        const existingCalendar = await Calendar.findOne({ user: data.user });
        if (existingCalendar) {
            return true; // El usuario ya tiene un calendario
        }
    
        // Crear el calendario
        const calendar = new Calendar(data);
        return await calendar.save(); // Devuelve el calendario creado
    }
    
    async getAppointmentsForADay(date: Date, userName: string): Promise<IAppointment[] | boolean | null> {
        // Buscar el usuario por nombre
        const user = await User.findOne({ name: userName });
        if (!user) {
            return true; // Usuario no encontrado
        }
    
        // Verificar si el usuario tiene un calendario
        const calendar = await Calendar.findOne({ user: user._id });
        if (!calendar) {
            return false; // El usuario no tiene un calendario
        }
    
        // Obtener las citas para el día especificado
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
        const calendarWithAppointments = await Calendar.findOne({ user: user._id }).populate({
            path: 'appointments',
            match: { inTime: { $gte: startOfDay, $lte: endOfDay } }
        });
    
        if (!calendarWithAppointments) {
            return []; // No hay citas para este día
        }
    
        const appointments = calendarWithAppointments.appointments as unknown as IAppointment[];
        return appointments; // Devuelve las citas
    }

    async  getCalendarOfUser(userName: string): Promise<ICalendar | null>{
        //Retorna null si no te calendari
        //Retorna el calendari si tot ha anat bé
        const user = await User.findOne({name:userName});
        if(user === null){
            return null
        }
        return await Calendar.findOne({user:user._id})
    }

    async addAppointmentToCalendar(userName: string, appointment: Partial<IAppointment>): Promise<ICalendar | null | boolean> {
        // Buscar el usuario por nombre
        const user = await User.findOne({ name: userName });
        if (!user) {
            return false; // Usuario no encontrado
        }
    
        // Verificar si el usuario tiene un calendario
        const calendar = await Calendar.findOne({ user: user._id });
        if (!calendar) {
            return true; // El usuario no tiene un calendario
        }
    
        // Guardar la cita
        const appointmentSaved = await new Appointment(appointment).save();
    
        // Actualizar el calendario con la nueva cita
        const updatedCalendar = await Calendar.findOneAndUpdate(
            { user: user._id },
            { $push: { appointments: appointmentSaved._id } },
            { new: true }
        );
        return updatedCalendar; // Calendario actualizado
    }

    async hardDeleteCalendarUser(userName: string): Promise<ICalendar | null> {
        const user = await User.findOne({name:userName});
        return await Calendar.findOneAndDelete({ user: user?._id });
    }

    async softDeleteCalendarUser(userName: string): Promise<ICalendar | null> {
        const user = await User.findOne({name:userName});
        return await Calendar.findOneAndUpdate(
            { user: user?._id },
            { isDeleted: true },
            { new: true }
        );
    }

    async restoreCalendarUser(userName: string): Promise<ICalendar | null> {
        const user = await User.findOne({name:userName});
        return await Calendar.findOneAndUpdate(
            { user: user?._id },
            { isDeleted: false },
            { new: true }
        );
    }
}