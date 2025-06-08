import { IAppointment } from 'models/appointment/appointment.model';
import mongoose from 'mongoose';

export interface ICalendar {
  owner: mongoose.Types.ObjectId;
  calendarName: string;
  appointments: mongoose.Types.ObjectId[] | IAppointment[];
  invitees: mongoose.Types.ObjectId[];
  isDeleted: boolean;
  defaultColour?: string;
  _id?: mongoose.Types.ObjectId;
}

const CalendarSchema = new mongoose.Schema<ICalendar>({
  owner: {
    type: mongoose.Schema.Types.ObjectId, // Usar Schema.Types.ObjectId
    required: true,
  },
  calendarName: {
    type: String,
    required: true,
  },
  appointments: [
    {
      type: mongoose.Schema.Types.ObjectId, // Usar Schema.Types.ObjectId
      ref: 'Appointment',
      default: [],
    },
  ],
  invitees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: [],
    },
  ],
  defaultColour: {
    type: String,
    required: false,
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },
});

// Hooks
CalendarSchema.pre('find', function () {
  this.where({ isDeleted: false });
});

CalendarSchema.pre('findOne', function () {
  this.where({ isDeleted: false });
});

const Calendar = mongoose.model<ICalendar>('Calendar', CalendarSchema);
export default Calendar;
