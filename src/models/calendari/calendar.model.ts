import mongoose from "mongoose";
import Appointment from '../appointment/appointment.model';

export interface ICalendar {
    user: mongoose.Types.ObjectId;
    appointments: mongoose.Types.ObjectId[];
    isDeleted: boolean;
}

const CalendarSchema = new mongoose.Schema<ICalendar>({
    user: { 
        type: mongoose.Schema.Types.ObjectId, // Usar Schema.Types.ObjectId
        required: true,
        ref: 'User'
    },
    appointments: [{ 
        type: mongoose.Schema.Types.ObjectId, // Usar Schema.Types.ObjectId
        ref: 'Appointment'
    }],
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    }
});

CalendarSchema.pre('find', function() {
    this.where({ isDeleted: false });
});

CalendarSchema.pre('findOne', function() {
    this.where({ isDeleted: false });
});

const Calendar = mongoose.model<ICalendar>('Calendar', CalendarSchema);
export default Calendar;