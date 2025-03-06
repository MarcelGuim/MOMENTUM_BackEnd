import mongoose from "mongoose";
import Appointment  from '../appointment/appointment.model';

const CalendarSchema = new mongoose.Schema<ICalendar>({
    user:{ 
        type: String,
        required:true
    },
    appointments: [{ type: mongoose.Types.ObjectId, ref: Appointment }],
    availableSlots:{
        type: [Date],
        required: true
    }
});

export interface ICalendar{
    user: String;
    appointments: mongoose.ObjectId[];
    availableSlots: Date[];
}


const Calendar = mongoose.model<ICalendar>('Calendar', CalendarSchema);
export default Calendar;