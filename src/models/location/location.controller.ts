import e, { Request, Response } from "express";
import { ILocation } from "./location.model";
import { LocationService } from "./location.services";
import { locationServiceType } from '../../enums/locationServiceType.enum';
import { PlaceQueryResult, RouteQuertResult } from "./location.interfaces";

//CRUD
const locationService = new LocationService();

export async function createLocationHandler(req:Request, res:Response): Promise<Response> {
    try{
        console.log("Creating location");
        const locationreveived: Partial<ILocation> = req.body;
        const location = await locationService.createLocation(locationreveived);
        
        if (location === -1) {
            return res.status(409).json({ message: 'Location already exists' });
        }
        if (location === 0) {
            return res.status(400).json({ message: 'Error with data format in schedule' });
        }
        if (location === 1) {
            console.error("ServiceTypes of location are not valid");
            return res.status(400).json({ message: 'ServiceTypes of location are not valid' });
        } else {
            return res.status(201).json({
                message: "Location created successfully",
                location: location
            });
        }
    }
    catch (error){
        console.error("Failed to create location",error);
        return res.status(500).json({ message: 'Failed to create location' });
    }
}

export async function getLocationByIdHandler(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    try {
        const location = await locationService.getLocationById(id);
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }
        return res.json(location);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch location' });
    }
}

export async function getAllLocationsHandler(req: Request, res: Response): Promise<Response> {
    try {
        const locations = await locationService.getAllLocations();
        return res.json(locations);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch locations' });
    }
}
export async function deleteLocationByIdHandler(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    try {
        const location = await locationService.deleteLocationById(id);
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }
        return res.json(location);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete location' });
    }
}
export async function updateLocationByIdHandler(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const data = req.body as Partial<ILocation>;
    try {
        const location = await locationService.updateLocationById(id, data);
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }
        return res.json(location);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update location' });
    }
}

export async function getAllLocationsByServiceTypeHandler(req: Request, res: Response): Promise<Response> {
    console.log("getting all locations of a service type")
    const { serviceType } = req.params;
    try {
        if (!Object.values(locationServiceType).includes(serviceType as locationServiceType)) {
            return res.status(400).json({ error: 'Invalid service type' });
        }
        const locations = await locationService.getAllLocationsByServiceType(serviceType as locationServiceType);
        return res.json(locations);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch locations' });
    }
}

export async function getLocationsNearHandler(req: Request, res: Response): Promise<Response> {
    console.log("✅ Entrando a getLocationsNearHandler");
  const { lat, lon, distance, serviceType } = req.query;

  // Validación básica
  if (!lat || !lon || !distance || !serviceType) {
    return res.status(400).json({ error: 'Missing query parameters: lat, lon, distance, or serviceType' });
  }

  // Validación de tipos
  if (isNaN(parseFloat(lat as string)) || isNaN(parseFloat(lon as string)) || isNaN(parseFloat(distance as string))) {
    return res.status(400).json({ error: 'lat, lon, and distance must be valid numbers' });
  }

  if (parseFloat(distance as string) <= 0) {
    return res.status(400).json({ error: 'distance must be a positive number' });
  }

  // Validación del serviceType
  if (!Object.values(locationServiceType).includes(serviceType as locationServiceType)) {
    return res.status(400).json({ 
      error: 'Invalid service type. Valid values are: ' + Object.values(locationServiceType).join(', ') 
    });
  }

  try {
    const results = await locationService.getLocationsNearByServiceType(
      parseFloat(lat as string),
      parseFloat(lon as string),
      parseFloat(distance as string),
      serviceType as locationServiceType
    );

    if (results.length === 0) {
      return res.status(200).json({ message: 'No nearby locations found', results });
    }

    return res.json(results);
  } catch (err) {
    console.error('Error fetching nearby locations:', err);
    return res.status(500).json({ error: 'Failed to fetch nearby locations' });
  }
}

export async function getPlacesHandler(req: Request, res: Response): Promise<Response> {
    try {
        const { lonmin, latmin, lonmax, latmax, query } = req.body;
        const lonmin_f = parseFloat(lonmin);
        const latmin_f = parseFloat(latmin);
        const lonmax_f = parseFloat(lonmax);
        const latmax_f = parseFloat(latmax)
        
        if(isNaN(lonmin_f) || isNaN(latmin_f) || isNaN(lonmax_f) || isNaN(latmax_f)){
            return res.status(400);
        }

        const places = await locationService.getPlaces(lonmin_f, latmin_f, lonmax_f, latmax_f, query);
        return res.json(places);
    } catch (error) {
        console.error(error)
        return res.status(500).json(error);
    }
}

export async function getRouteHandler(req: Request, res: Response): Promise<Response> {
    try {
        const {lon1, lat1, lon2, lat2, mode} = req.body;
        const lon1_f = parseFloat(lon1);
        const lat1_f = parseFloat(lat1);
        const lon2_f = parseFloat(lon2);
        const lat2_f = parseFloat(lat2);

        if(isNaN(lon1_f) || isNaN(lat1_f) || isNaN(lon2_f) || isNaN(lat2_f)){
            return res.status(400);
        }

        const route = await locationService.getRouteInfo(lon1_f, lat1_f, lon2_f, lat2_f, mode);
        return res.json(route);
    } catch (error) {
        console.error(error);
        return res.status(500).json(error);
    }
}

export async function getWorkersOfLocation(req: Request, res: Response): Promise<Response> {
    try {
        const { id } = req.params;
        const workers = await locationService.getWorkersOfLocation(id);
        if (!workers) {
            return res.status(404).json({ error: 'Workers of location not found' });
        }
        return res.status(201).json(workers);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch workers' });
    }
}

export async function getLocationByNameHandler(req: Request, res: Response): Promise<Response> {
    try {
        const { name } = req.params;
        const location = await locationService.getLocationByName(name);
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }
        return res.json(location);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch location' });
    }
}

export async function getBussinessIdFromLocationId(req: Request, res: Response): Promise<Response> {
    try {
        const { id } = req.params;
        const businessId = await locationService.getBusinessIdFromLocationId(id);
        if (!businessId) {
            return res.status(404).json({ error: 'Business ID not found' });
        }
        return res.json(businessId);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch business ID' });
    }
}

export async function getCities(req: Request, res: Response): Promise<Response> {
    try {
      const cities = await locationService.getCitiesFromAddresses();
  
      if (cities === -1) {
        console.error('Error intern: no s\'han pogut extreure les ciutats');
        return res.status(500).json({
          message: 'Internal server error while extracting cities. Check address formats.'
        });
      }
  
      if (!Array.isArray(cities) || cities.length === 0) {
        return res.status(404).json({ message: 'No cities found in the database.' });
      }
  
      return res.status(200).json({ cities });
    } catch (error) {
      console.error('Unexpected error retrieving cities:', error);
      return res.status(500).json({ message: 'Unexpected server error' });
    }
  }
  