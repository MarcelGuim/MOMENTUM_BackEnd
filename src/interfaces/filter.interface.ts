import { locationSchedule } from '../enums/locationSchedule.enum';
export interface LocationFilter {
  isDeleted: boolean;
  serviceType?: { $in: string[] };
  address?: { $regex: string; $options: string };
  rating?: { $gte: number };
  schedule?: {
    $elemMatch: {
      day: string;
      open: { $lte: string };
      close: { $gt: string };
    };
  };
  ubicacion?: {
    $near: {
      $geometry: {
        type: 'Point';
        coordinates: [number, number];
      };
      $maxDistance: number;
    };
  };
  $or?: { address: { $regex: string; $options: string } }[];
}

export interface FilterOptions {
  serviceTypes?: string[];
  cities?: string[];
  ratingMin?: number;
  day?: locationSchedule;
  time?: string;
  lat?: number;
  lon?: number;
  maxDistance?: number;
}
