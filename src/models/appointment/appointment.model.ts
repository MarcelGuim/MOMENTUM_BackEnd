import { Schema, model, Document, ObjectId } from 'mongoose';

const AppointmentSchema = new Schema<IAppointment>({
    inTime:{
        type:Date,
        required:true
    },
    outTime:{
        type:Date,
        required:true
    },
    place:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    }
});

export interface IAppointment{
    _id?: ObjectId;
    inTime:Date;
    outTime:Date;
    place:String;
    title:String;
}


const Appointment = model<IAppointment>('Appointment', AppointmentSchema);
export default Appointment;