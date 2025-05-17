import mongoose, { Schema, Document } from 'mongoose';
import { locationServiceType } from '../../enums/locationServiceType.enum';
import { locationSchedule } from '../../enums/locationSchedule.enum';
import { GeoJSONPoint } from '../../types';

export interface ILocation extends Document {
  _id: mongoose.Types.ObjectId;
  nombre: string;
  address: string;
  phone: string;
  rating: number;
  ubicacion: GeoJSONPoint;
  serviceType: locationServiceType[];
  schedule: {
    day: locationSchedule;
    open: string;  // HH:mm
    close: string; // HH:mm
  }[];
  business: mongoose.Types.ObjectId;
  workers: mongoose.Types.ObjectId[];
  isDeleted: boolean;
}
//const LocationSchema: Schema = new Schema({
const LocationSchema = new mongoose.Schema<ILocation>({

  nombre: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  rating: { type: Number, required: true },
  ubicacion: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  serviceType: {
    type: [String], 
    enum: Object.values(locationServiceType),
    required: true,
    default: [], 
  },
  schedule: {
    type: [
      {
        day: {
          type: String,
          enum: Object.values(locationSchedule),
          required: true
        },
        open: {
          type: String,
          required: true,
          match: [/^([0-1]\d|2[0-3]):([0-5]\d)$/, 'Open hour must be in HH:mm format']
        },
        close: {
          type: String,
          required: true,
          match: [/^([0-1]\d|2[0-3]):([0-5]\d)$/, 'Close hour must be in HH:mm format']
        }
      }
    ],
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Business'
  },
  workers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Worker'
    }
  ],
  isDeleted: {
    type: Boolean,
    required: true,
    default: false
  }
});

// Índice geoespacial para habilitar consultas espaciales
LocationSchema.index({ ubicacion: '2dsphere' });

export default mongoose.model<ILocation>('Location', LocationSchema);
