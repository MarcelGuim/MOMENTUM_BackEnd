import { Request, Response } from "express";
import { getPlaces } from "./location.services";

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