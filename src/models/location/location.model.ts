import mongoose, { Schema, Document } from 'mongoose';

interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface ILocation extends Document {
  _id: mongoose.Types.ObjectId;
  nombre: string;
  address: string;
  rating: number;
  ubicacion: GeoJSONPoint;
}
//const LocationSchema: Schema = new Schema({
const LocationSchema = new mongoose.Schema<ILocation>({

  nombre: { type: String, required: true },
  address: { type: String, required: true },
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
  }
});

// Índice geoespacial para habilitar consultas espaciales
LocationSchema.index({ ubicacion: '2dsphere' });

export default mongoose.model<ILocation>('Location', LocationSchema);
