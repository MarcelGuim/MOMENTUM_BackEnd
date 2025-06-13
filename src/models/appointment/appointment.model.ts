import mongoose, { Schema, model, ObjectId } from 'mongoose';
import { appointmentServiceType } from '../../enums/appointmentServiceType.enum';
import { appointmentState } from '../../enums/appointmentState.enum';
import { GeoJSONPoint } from '../../types';

export interface IAppointment {
  _id?: ObjectId;
  calendarId?: ObjectId;
  inTime: Date;
  outTime: Date;
  title: string;
  description?: string;
  location?: mongoose.Types.ObjectId;
  serviceType: appointmentServiceType;
  appointmentState?: appointmentState;
  colour?: string;
  customAddress?: string; // e.g. "123 Main St, Apt 4B, New York"
  customUbicacion?: GeoJSONPoint;
  isDeleted: boolean;
}
const AppointmentSchema = new Schema<IAppointment>({
  inTime: {
    type: Date,
    required: true,
  },
  outTime: {
    type: Date,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'Location',
  },
  serviceType: {
    type: String,
    enum: Object.values(appointmentServiceType),
    required: true,
    default: appointmentServiceType.PERSONAL,
  },
  appointmentState: {
    type: String,
    enum: Object.values(appointmentState),
    required: false,
    default: appointmentState.REQUESTED,
  },
  colour: {
    type: String,
    required: false,
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },
  customAddress: {
    type: String,
    required: false,
  },
  customUbicacion: {
    type: {
      type: String,
      enum: ['Point'],
      required: false,
      default: undefined,
    },
    coordinates: {
      type: [Number],
      required: false,
      default: undefined,
    },
  },
});

AppointmentSchema.pre('find', function () {
  this.where({ isDeleted: false });
});

AppointmentSchema.pre('findOne', function () {
  this.where({ isDeleted: false });
});

const Appointment = model<IAppointment>('Appointment', AppointmentSchema);

export default Appointment;
