import { Schema, model, Document, ObjectId } from 'mongoose';

const AppointmentSchema = new Schema<IAppointment>({
    date:{
        type:Date,
        required: true
    },
    inTime:{
        type:Number,
        required:true
    },
    outTime:{
        type:Number,
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
    _id?: string;
    date:Date;
    inTime:number;
    outTime:number;
    place:String;
    title:String;
}


const Appointment = model<IAppointment>('Appointment', AppointmentSchema);
export default Appointment;