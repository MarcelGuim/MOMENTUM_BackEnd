import { Request, Response } from "express";
import { getPlaces, getRouteInfo } from "./location.services";

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