import { Request, Response } from 'express';
import { IBusiness } from './business.model';
import { BusinessService } from './business.services';
import {IAppointment} from '../appointment/appointment.model'

const businessService = new BusinessService();
export async function createBusiness(req: Request, res: Response): Promise<Response> {
    try {
        console.log("Creating business");
        const business: Partial<IBusiness> = req.body;
        const answer = await businessService.createBusiness(business);

        if (answer === null) {
            console.error("No locations provided");
            return res.status(400).json({
                message: "No locations provided"
            });
        } 
        if (typeof answer === 'number' && answer > 0) {
            console.error(`There are ${answer} invalid locations when creating business`);
            return res.status(400).json({
                message: `There are ${answer} invalid locations when creating business`
            });
        }
        if (typeof answer === 'number' && answer ===-1) {
            console.error(`The business already exists`);
            return res.status(409).json({
                message: `The business already exists`
            });
        }
        if (typeof answer === 'number' && answer ===-2) {
            console.error(`The IDs format of locations is not valid`);
            return res.status(400).json({
                message: `The IDs format of locations is not valid`
            });
        }
        else {
            console.log("Business created");
            return res.status(201).json({
                message: "Business created",
                business: answer
            });
        }
    } catch (error) {
        console.error("Server Error");
        return res.status(500).json({
            message: "Server Error"
        });
    }
}
export async function getAllBusiness(req: Request, res: Response): Promise<Response> {
    try {
        const businesses = await businessService.getAllBusiness();
        return res.status(200).json({
            message: "Businesses found",
            businesses,
        });
    } catch (error) {
        console.error("Server error when getting all business:", error);
        return res.status(500).json({
            message: "Server error when getting all business",
        });
    }
}

export async function getLocationsFromBusinessbyId(req: Request, res: Response): Promise<Response> {
    try {
        const { id } = req.params;
        const answer = await businessService.getLocationsFromBusinessbyId(id);
        if (typeof answer === 'number' && answer ===-1) {
            console.error(`The ID format of the business is not valid`);
            return res.status(400).json({
                message: `The ID format of the business is not valid`
            });
        }
        if (answer === null) {
            console.error("Id does not match any Business");
            return res.status(400).json({
                message: "Id does not match any Business"
            });
        } 
        return res.status(200).json({
            message: "Locations from business found",
            locations: answer,
        });
    } catch (error) {
        console.error("Server error when getting locations from business:", error);
        return res.status(500).json({
            message: "Server error when getting locations from business",
        });
    }
}

export async function getAllLocationsFromBusinessbyServiceType(req: Request, res: Response): Promise<Response> {
    try {
        const { businessId } = req.params;
        const { serviceType } = req.query;

        if (!serviceType || typeof serviceType !== 'string') {
            console.error("Invalid or missing serviceType");
            return res.status(400).json({ message: "Invalid or missing serviceType" });
        }

        const locations = await businessService.getAllLocationsFromBusinessbyServiceType(businessId, serviceType);

        if (locations === -1) {
            console.error("Invalid business ID format");
            return res.status(400).json({ message: "Invalid business ID format" });
        }

        if (locations === -2) {
            console.error("Invalid serviceType");
            return res.status(400).json({ message: "Invalid serviceType" });
        }
        if (locations === -3) {
            console.error("No location found with this serviceType");
            return res.status(404).json({ message: "No location found with this serviceType" });
        }
        if (locations === null) {
            console.error("Business not found");
            return res.status(404).json({ message: "Business not found" });
        }

        console.log("Locations with the specified serviceType found");
        return res.status(200).json({ message: "Locations with the specified serviceType found", locations });
    } catch (error) {
        console.error("Server error when getting locations by service type:", error);
        return res.status(500).json({ message: "Server error when getting locations by service type" });
    }
}
export async function getAllBusinessWithLocationOfferingServiceType(req: Request, res: Response): Promise<Response> {
    try {
        const { serviceType } = req.params; 

        const result = await businessService.getAllBusinesswithLocationofferingServiceType(serviceType);

        if (result === -1) {
            console.error("Invalid serviceType format");
            return res.status(400).json({ message: "Invalid serviceType" });
        }
        if (result === null) {
            console.error("No businesses found with locations offering the specified serviceType");
            return res.status(404).json({ message: "No businesses found with locations offering the specified serviceType" });
        }
        return res.status(200).json({
            message: "Businesses retrieved successfully",
            businesses: result,
        });
    } catch (error) {
        console.error("Error finding businesses with locations offering serviceType:", error);
        return res.status(500).json({ message: "Failed to retrieve businesses" });
    }
}
export async function createLocationForBusiness(req: Request, res: Response): Promise<Response> {
    try {
        const { businessId } = req.params;
        const locationData = req.body;

        const result = await businessService.createLocationForBusiness(businessId, locationData);

        if (result === -1) {
            console.error("Invalid business ID format");
            return res.status(400).json({ message: "Invalid business ID format" });
        }

        if (result === -2) {
            console.error("Location already exists");
            return res.status(409).json({ message: "Location already exists" });
        }

        if (result === -3) {
            console.error("Invalid schedule format");
            return res.status(400).json({ message: "Invalid schedule format" });
        }

        if (result === -4) {
            console.error("ServiceTypes of location are not valid");
            return res.status(400).json({ message: "ServiceTypes of location are not valid" });
        }

        if (result === null) {
            console.error("Business not found");
            return res.status(404).json({ message: "Business not found" });
        }

        return res.status(201).json({
            message: "Location created and added to business",
            business: result,
        });
    } catch (error) {
        console.error("Error creating location for business:", error);
        return res.status(500).json({ message: "Failed to create location for business" });
    }
}
export async function deleteLocationForBusiness(req: Request, res: Response): Promise<Response> {
    try {
        const { businessId, locationId } = req.params;

        const result = await businessService.deleteLocationForBusiness(businessId, locationId);

        if (result === -1) {
            console.error("Invalid business ID format");
            return res.status(400).json({ message: "Invalid business ID format" });
        }

        if (result === -2) {
            console.error("Invalid location ID format");
            return res.status(400).json({ message: "Invalid location ID format" });
        }

        if (result === -3) {
            console.error("Location not found in business");
            return res.status(404).json({ message: "Location not found in business" });
        }

        if (result === -4) {
            console.error("Location not found in database");
            return res.status(404).json({ message: "Location not found in database" });
        }

        if (result === null) {
            console.error("Business not found");
            return res.status(404).json({ message: "Business not found" });
        }

        return res.status(200).json({
            message: "Location deleted successfully from business",
            business: result,
        });
    } catch (error) {
        console.error("Error deleting location for business:", error);
        return res.status(500).json({ message: "Failed to delete location for business" });
    }
}

export async function softDeleteBusiness(req: Request, res: Response): Promise<Response> {
    try {
        const { businessId } = req.params;

        const result = await businessService.softDeleteBusiness(businessId);

        if (result === -1) {
            console.error("Invalid business ID format");
            return res.status(400).json({ message: "Invalid business ID format" });
        }

        if (result === null) {
            console.error("Business not found");
            return res.status(404).json({ message: "Business not found" });
        }

        if (result === -2) {
            console.error("Failed to softdelete all associated locations");
            return res.status(500).json({ message: "Failed to softdelete all associated locations" });
        }

        if (typeof result !== 'number' && result.isDeleted === false) {
            console.error("Failed to softdelete business, all associated locations have been softdeleted");
            return res.status(500).json({ message: "Failed to softdelete business, all associated locations have been softdeleted" });
        }

        return res.status(200).json({
            message: "Business and its locations were soft deleted successfully",
            business: result,
        });
        
    } catch (error) {
        console.error("Error performing soft delete for business:", error);
        return res.status(500).json({ message: "Failed to perform soft delete for business" });
    }
}
export async function hardDeleteBusiness(req: Request, res: Response): Promise<Response> {
    try {
        const { businessId } = req.params; 
        const result = await businessService.hardDeleteBusiness(businessId);

        if (result === -1) {
            console.error("Invalid business ID format");
            return res.status(400).json({ message: "Invalid business ID format" });
        }

        if (result === null) {
            console.error("Business not found");
            return res.status(404).json({ message: "Business not found" });
        }

        return res.status(200).json({
            message: "Business and its locations were deleted successfully",
            business: result,
        });
    } catch (error) {
        console.error("Error performing hard delete for business:", error);
        return res.status(500).json({ message: "Failed to perform hard delete for business" });
    }
}

