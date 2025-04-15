import e, { Request, Response } from "express";
import { getPlaces, getRouteInfo } from "./location.services";
import { ILocation } from "./location.model";
import { createLocation, getLocationById, getAllLocations, deleteLocationById, updateLocationById} from "./location.services";
import { PlaceQueryResult, RouteQuertResult } from "./location.interfaces";

//CRUD

export async function createLocationHandler(req:Request, res:Response): Promise<Response> {
    try{
        console.log("Creating location");
        const locationreveived: Partial<ILocation> = req.body;
        const location = await createLocation(locationreveived);
        
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
        const location = await getLocationById(id);
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
        const locations = await getAllLocations();
        return res.json(locations);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch locations' });
    }
}
export async function deleteLocationByIdHandler(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    try {
        const location = await deleteLocationById(id);
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
        const location = await updateLocationById(id, data);
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }
        return res.json(location);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update location' });
    }
}   



export async function getPlacesHandler(req: Request, res: Response){
    try {
        const { lonmin, latmin, lonmax, latmax, query } = req.body;
        const lonmin_f = parseFloat(lonmin);
        const latmin_f = parseFloat(latmin);
        const lonmax_f = parseFloat(lonmax);
        const latmax_f = parseFloat(latmax)
        
        if(isNaN(lonmin_f) || isNaN(latmin_f) || isNaN(lonmax_f) || isNaN(latmax_f)){
            return res.status(400);
        }

        const places = await getPlaces(lonmin_f, latmin_f, lonmax_f, latmax_f, query);
        return res.json(places);
    } catch (error) {
        console.error(error)
        return res.status(500).json(error);
    }
}

export async function getRouteHandler(req: Request, res: Response){
    try {
        const {lon1, lat1, lon2, lat2, mode} = req.body;
        const lon1_f = parseFloat(lon1);
        const lat1_f = parseFloat(lat1);
        const lon2_f = parseFloat(lon2);
        const lat2_f = parseFloat(lat2);

        if(isNaN(lon1_f) || isNaN(lat1_f) || isNaN(lon2_f) || isNaN(lat2_f)){
            return res.status(400);
        }

        const route = await getRouteInfo(lon1_f, lat1_f, lon2_f, lat2_f, mode);
        return res.json(route);
    } catch (error) {
        console.error(error);
        return res.status(500).json(error);
    }
}