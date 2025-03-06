import { promises } from 'dns';
import Calendar, {ICalendar} from './calendar.model';
import User, {IUsuari} from '../users/user.model';
import Appointment, { IAppointment } from '../appointment/appointment.model';
import { start } from 'repl';


export class CalendarService {
    async createCalendar(data:Partial<ICalendar>):Promise<ICalendar | Boolean>{
        //retorna false si no existeix el user, retorna true si aquest user ja te un calendari iniciat
        //retorna el calendari si tot ha anat bé
        const calendar = await Calendar.findOne({user:data.user})
        const user = await User.findOne({_id: data.user})
        if(user == null)
            return false
        else if(calendar != null)
            return true
        else{
            const calendar = new Calendar(data);
            return await calendar.save()
        }
    }
    
    async getAppointmentsForADay(date: Date, userName: string): Promise<IAppointment[] | boolean | null> {
        //retorna true si no hi ha user amb aquell nom
        //retorna false si l'usuari no te calendari
        //retorna els appointments si tot ha anat bé
        const user = await User.findOne({name:userName});
        if(user === null)
        {
            return true
        }
        const startOfDay = new Date(date.setHours(0,0,0,0));
        const endOfDay = new Date(date.setHours(23,59,59,999));
        const calendar = await Calendar.findOne({ user:user._id }).populate(
            {path:'appointments', match:{inTime: {$gte:startOfDay, $lte:endOfDay}}})
        if (!calendar) {
          return false;
        }
        const appointments= calendar.appointments as unknown as IAppointment[]
        return appointments ;
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

    async addAppointmentToCalendar(userName: string, appointment:Partial<IAppointment>): Promise<ICalendar | null | boolean>{
        //retorna false si no existeix l'usuari, retorna true si no existeix el calendari
        //retorna el calendari actualitzat si ho ha fet bé.
        const user = await User.findOne({name:userName});
        if (user === null){
            return false;
        }
        const appointmentSaved = await new Appointment(appointment).save()
        const calendar = await Calendar.findOneAndUpdate({user:user._id},{$push: {appointments: appointmentSaved._id}}, {new:true});
        if (calendar === null){
            return true;
        }
        return calendar;
    }
}