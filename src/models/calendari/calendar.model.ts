import mongoose from "mongoose";
import Appointment  from '../appointment/appointment.model';

const CalendarSchema = new mongoose.Schema<ICalendar>({
    user:{ 
        type: mongoose.Types.ObjectId,
        required:true
    },
    appointments: [{ type: mongoose.Types.ObjectId, ref: Appointment }]
});

export interface ICalendar{
    user: mongoose.ObjectId;
    appointments: mongoose.ObjectId[];
}


const Calendar = mongoose.model<ICalendar>('Calendar', CalendarSchema);
export default Calendar;