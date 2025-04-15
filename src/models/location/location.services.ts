import { PlaceQueryResult, RouteQuertResult } from "./location.interfaces";
import Location from './location.model';
import { ILocation } from './location.model';
import { locationServiceType } from '../../enums/locationServiceType.enum';
import { locationSchedule } from '../../enums/locationSchedule.enum';

//CRUD
export async function createLocation(location: Partial<ILocation>): Promise<ILocation|Number> {
    //Mirem que els serviceTypes siguin vàlids
    if (location.serviceType && Array.isArray(location.serviceType)) {
        const invalidServiceTypes = location.serviceType.filter(
            (type) => !Object.values(locationServiceType).includes(type)
        );

        if (invalidServiceTypes.length > 0) {
            //Retorna un 1 si el servicetype no forma part de enum de locationServiceType
            return 1; 
        }
    }
    //Mirem que les dades de schedule siguin valides
    if (location.schedule && Array.isArray(location.schedule)) {
        const invalidSchedules = location.schedule.filter((entry) => {
            // Verificar que el dia sigui valid
            if (!Object.values(locationSchedule).includes(entry.day)) {
                return true;
            }
            // Verificar que las hores estiguin en format HH:mm
            const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
            if (!timeRegex.test(entry.open) || !timeRegex.test(entry.close)) {
                return true;
            }

            // Verificar que l'hora de tancament sigui posterior a l'hora d'obertura
            return entry.open >= entry.close;
        });

        if (invalidSchedules.length > 0) {
            return 0;
        }
    }
    const result = await Location.findOne({$or: [{ address: location.address }, { nombre: location.nombre }]});
    if (result !== null) {
      return -1;
    } else {
      const newLocation = new Location(location);
      return await newLocation.save();
    }
}

export async function getLocationById(id: string): Promise<ILocation | null> {
    const location = await Location.findById(id);
    return location;
}

export async function getAllLocations(): Promise<ILocation[]> {
    const locations = await Location.find({});
    return locations;
}

export async function deleteLocationById(id: string): Promise<ILocation | null> {
    const location = await Location.findByIdAndDelete(id);
    return location;
}

export async function updateLocationById(id: string, data: Partial<ILocation>): Promise<ILocation | null> {
    return await Location.findByIdAndUpdate(id, data, { new: true });
}

export async function getAllLocationsByServiceType(serviceType: locationServiceType): Promise<ILocation[]> {
    const locations = await Location.find({ serviceType: serviceType });
    return locations;
}

//Funció per obtenir ubicacions a prop d'un punt donat amb un tipus de servei específic
export async function getLocationsNearByServiceType(
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
          $maxDistance: maxDistanceMeters
        }
      },
      serviceType: serviceType
    });
}


export async function getPlaces(lonmin: number, latmin: number, lonmax: number, latmax: number, query: string): Promise<PlaceQueryResult[]>{
    const url = "https://places.googleapis.com/v1/places:searchText";
    const apikey = process.env.GOOGLE_APIKEY;
    if(!apikey) throw new Error('❌ Google API key is not defined');
    const response = await fetch(url, {
        method: "POST",
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
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apikey,
            "X-Goog-FieldMask": "places", 
        }
    })
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

export type TravelMode = "DRIVE" | "BICYCLE" | "WALK" | "TRANSIT"

export async function getRouteInfo(lon1: number, lat1: number, lon2: number, lat2: number, travelMode: TravelMode) {
    const url = "https://routes.googleapis.com/directions/v2:computeRoutes";
    const apikey = process.env.GOOGLE_APIKEY;
    if(!apikey) throw new Error('❌ Google API key is not defined');
    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
            origin: {
                location: {
                    latLng: {
                        latitude: lat1,
                        longitude: lon1,
                    }
                }
            },
            destination: {
                location: {
                    latLng: {
                        latitude: lat2,
                        longitude: lon2,
                    }
                }
            },
            travelMode: travelMode,
            computeAlternativeRoutes: false,
            units: "METRIC",
        }),
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apikey,
            "X-Goog-FieldMask": "routes.duration,routes.duration,routes.localizedValues.duration", 
        }
    });

    const responseObject = await response.json();
    return responseObject.routes.map((r: any) => {
        const route: RouteQuertResult = {
            durationReadable: r.localizedValues.duration.text,
            durationSeconds: r.duration,
        }
        return route;
    });
}