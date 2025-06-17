import mongoose, { Schema, model } from 'mongoose';
import { RepetitionType } from '../../enums/recordatorisRepetition.enum';

const RecordatorisSchema = new Schema<IRecordatoris>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  time: {
    type: Date,
    required: true,
  },
  repeat: {
    type: String,
    enum: Object.values(RepetitionType),
    required: true,
  },
});

export interface IRecordatoris {
  user: mongoose.Schema.Types.ObjectId;
  title: string;
  description: string;
  time: Date;
  repeat: RepetitionType;
}

const Recordatoris = model<IRecordatoris>('Recordatoris', RecordatorisSchema);
export default Recordatoris;
