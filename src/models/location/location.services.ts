import { PlaceQueryResult, RouteQuertResult } from './location.interfaces';
import Location from './location.model';
import { ILocation } from './location.model';
import { locationServiceType } from '../../enums/locationServiceType.enum';
import { IWorker } from '../worker/worker.model';
import Business, { IBusiness } from '../business/business.model';
//CRUD

type TravelMode = 'DRIVE' | 'BICYCLE' | 'WALK' | 'TRANSIT';

export class LocationService {
  async createLocation(
    location: Partial<ILocation>
  ): Promise<ILocation | Number> {
    if (location.serviceType && Array.isArray(location.serviceType)) {
      const invalidServiceTypes = location.serviceType.filter(
        (type) => !Object.values(locationServiceType).includes(type)
      );
      if (invalidServiceTypes.length > 0) throw new Error('wrong service Type');
    }
    if (location.schedule && Array.isArray(location.schedule)) {
      const invalidSchedules = location.schedule.filter((entry) => {
        const validDays = [
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday',
        ];
        if (!validDays.includes(entry.day.toLowerCase())) {
          return true;
        }
        const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(entry.open) || !timeRegex.test(entry.close)) {
          return true;
        }
        return entry.open >= entry.close;
      });
      if (invalidSchedules.length > 0) throw new Error('wrong schedule');
    }
    const result = await Location.findOne({
      $or: [{ address: location.address }, { nombre: location.nombre }],
    });
    if (result) throw new Error('Location already exists');
    const newLocation = new Location(location);
    const newLocationSaved = await newLocation.save();
    await Business.findByIdAndUpdate(location.business, {
      $push: { location: newLocationSaved._id },
    });
    return newLocationSaved;
  }

  async getLocationById(id: string): Promise<ILocation | null> {
    const location = await Location.findById(id);
    return location;
  }

  async getAllLocations(): Promise<ILocation[]> {
    const locations = await Location.find({});
    return locations;
  }

  async deleteLocationById(id: string): Promise<ILocation | null> {
    const location = await Location.findByIdAndDelete(id);
    return location;
  }

  async updateLocationById(
    id: string,
    data: Partial<ILocation>
  ): Promise<ILocation | null> {
    return await Location.findByIdAndUpdate(id, data, { new: true });
  }

  async getAllLocationsByServiceType(
    serviceType: locationServiceType
  ): Promise<ILocation[]> {
    const locations = await Location.find({ serviceType: serviceType });
    return locations;
  }

  async getLocationsNearByServiceType(
    lat: number,
    lon: number,
    maxDistanceKm: number,
    serviceType: locationServiceType
  ): Promise<ILocation[]> {
    // Convertimos distancia a metros porque Mongo espera metros
    const maxDistanceMeters = maxDistanceKm * 1000;

    return await Location.find({
      ubicacion: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [lon, lat], // Mongo espera [long, lat]
          },
          $maxDistance: maxDistanceMeters,
        },
      },
      serviceType: serviceType,
    });
  }

  async getPlaces(
    lonmin: number,
    latmin: number,
    lonmax: number,
    latmax: number,
    query: string
  ): Promise<PlaceQueryResult[]> {
    const url = 'https://places.googleapis.com/v1/places:searchText';
    const apikey = process.env.GOOGLE_APIKEY;
    if (!apikey) throw new Error('❌ Google API key is not defined');
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        textQuery: query,
        locationBias: {
          rectangle: {
            low: {
              longitude: lonmin,
              latitude: latmin,
            },
            high: {
              longitude: lonmax,
              latitude: latmax,
            },
          },
        },
        pageSize: 10,
      }),
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apikey,
        'X-Goog-FieldMask': 'places',
      },
    });
    const responseObject = await response.json();
    return responseObject.places.map((p: any) => {
      const place: PlaceQueryResult = {
        id: p.id,
        name: p.displayName.text,
        address: p.formattedAddress,
        longitude: p.location.longitude,
        latitude: p.location.latitude,
        rating: p.rating,
      };

      return place;
    });
  }

  async getRouteInfo(
    lon1: number,
    lat1: number,
    lon2: number,
    lat2: number,
    travelMode: TravelMode
  ) {
    const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';
    const apikey = process.env.GOOGLE_APIKEY;
    if (!apikey) throw new Error('❌ Google API key is not defined');
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        origin: {
          location: {
            latLng: {
              latitude: lat1,
              longitude: lon1,
            },
          },
        },
        destination: {
          location: {
            latLng: {
              latitude: lat2,
              longitude: lon2,
            },
          },
        },
        travelMode: travelMode,
        computeAlternativeRoutes: false,
        units: 'METRIC',
      }),
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apikey,
        'X-Goog-FieldMask':
          'routes.duration,routes.duration,routes.localizedValues.duration',
      },
    });

    const responseObject = await response.json();
    return responseObject.routes.map((r: any) => {
      const route: RouteQuertResult = {
        durationReadable: r.localizedValues.duration.text,
        durationSeconds: r.duration,
      };
      return route;
    });
  }

  async getWorkersOfLocation(locationId: string): Promise<IWorker[]> {
    const location = await Location.findById(locationId).populate('workers');
    if (!location) {
      throw new Error('Location not found');
    }
    return location.workers as unknown as IWorker[];
  }

  async getLocationByName(name: string): Promise<ILocation | null> {
    const location = await Location.findOne({ nombre: name });
    return location;
  }

  async getBusinessIdFromLocationId(
    locationId: string
  ): Promise<string | null> {
    const location = await Location.findById(locationId).populate('business');
    if (!location) {
      throw new Error('Location not found');
    }
    const business: IBusiness = location.business as unknown as IBusiness;
    return business._id?.toString() as string;
  }

  async getCitiesFromAddresses(): Promise<string[] | number> {
    try {
      const locations = await Location.find({ isDeleted: false }, 'address');

      const citySet = new Set<string>();

      for (const loc of locations) {
        if (!loc.address || typeof loc.address !== 'string') continue;

        const match = loc.address.match(/\d{5}\s([^,]+)/);
        if (match && match[1]) {
          citySet.add(match[1].trim());
        }
      }

      return Array.from(citySet).sort();
    } catch (error) {
      console.error('Error extracting cities from locations:', error);
      return -1;
    }
  }
}
