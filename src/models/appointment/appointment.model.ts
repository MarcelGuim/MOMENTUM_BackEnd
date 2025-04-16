import { Schema, model, Document, ObjectId } from 'mongoose';

export interface IAppointment {
    _id?: ObjectId;
    inTime: Date;
    outTime: Date;
    place: string;
    title: string;
    colour?: string;
    isDeleted: boolean;
}

const AppointmentSchema = new Schema<IAppointment>({
    inTime: {
        type: Date,
        required: true
    },
    outTime: {
        type: Date,
        required: true
    },
    place: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    colour: {
        type: String,
        required: false
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false 
    }
});

AppointmentSchema.pre('find', function() {
    this.where({ isDeleted: false });
});

AppointmentSchema.pre('findOne', function() {
    this.where({ isDeleted: false });
});

const Appointment = model<IAppointment>('Appointment', AppointmentSchema);

export default Appointment;
