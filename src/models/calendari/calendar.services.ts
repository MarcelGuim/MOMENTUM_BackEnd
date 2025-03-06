import { promises } from 'dns';
import {ICalendar} from './calendar.model';
import Calendar from './calendar.model';
import User from '../users/user.model';
import Appointment from '../appointment/appointment.model';
import { IAppointment } from '../appointment/appointment.model';


export class CalendarService {
    async createCalendar(data:Partial<ICalendar>):Promise<ICalendar | Boolean>{
        //retorna false si no existeix el user, retorna true si aquest user ja te un calendari iniciat
        //retorna el calendari si tot ha anat bé
        const calendar = Calendar.findOne({name:data.user})
        const user = User.findOne({name: data.user})
        if(user == null)
            return false
        else if(calendar != null)
            return true
        else{
            const calendar = new Calendar(data);
            return await calendar.save()
        }
    }
    
    async getAppointmentsForADay(/*date: Date, */userName: string): Promise<IAppointment[] | boolean> {
        const calendar = await Calendar.findOne({ user: userName }).populate('appointments')
        console.log("the username is: " + userName)
        if (!calendar) {
          return false;
        }
        console.log("The calendar is: " + calendar)
        const appointmentsForDay= calendar.appointments as unknown as IAppointment[]
        console.log("The appointments for the day are: " + appointmentsForDay)
        return appointmentsForDay;
      }

}