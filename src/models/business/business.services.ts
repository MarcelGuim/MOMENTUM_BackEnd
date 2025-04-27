import Business, { IBusiness } from "./business.model";
import Location, { ILocation } from "../location/location.model";
import mongoose from "mongoose";
import { locationServiceType } from '../../enums/locationServiceType.enum';
import { LocationService } from "../location/location.services";

const locationService = new LocationService();
export class BusinessService{
    async createBusiness(data: Partial<IBusiness>): Promise<IBusiness | null | number> {
        //Verificar que el nom del business no existeix
        const existingBusiness = await Business.findOne({ name: data.name });
        if (existingBusiness !== null) {
            return -1; 
        }
        const business = new Business(data);
        return await business.save();
/*         if (Array.isArray(data.location) && data.location.length > 0) {
           
            //Verificar si el format dels ID de locations és vàlid
            const invalidFormatIds = data.location.filter(
                (id) => !mongoose.Types.ObjectId.isValid(id)
            );

            if (invalidFormatIds.length > 0) {
                return -2; 
            }
            
            // Verificar si las locations son vàlides (existeixen en la base de dades)
            const validLocations = await Location.find({
                _id: { $in: data.location }, // Mirem quins dels IDs de location són a la base de dades
            });

            const validLocationIds = validLocations.map(location => location._id.toString());
            const invalidLocations = data.location.filter(id => !validLocationIds.includes(id.toString()));

            if (invalidLocations.length > 0) {
                //console.log("Invalid locations when creating business:", invalidLocations);
                return invalidLocations.length; // Retorna el nombre de locations invàlides
            }
            const business = new Business(data);
            return await business.save();
        }
        else {
            // Retorna null si no s'han passat locations
            return null; 
        } */
    }
   
    //Funció que retorna tots els Business amb les corresponents locations
    async getAllBusiness(): Promise<IBusiness[] | null> {
        const businesses = await Business.find({ isDeleted: false }).populate('location');
        return businesses;
    }

    //Funció que retorna totes les locations d'un business a partir del ID del business
    async getLocationsFromBusinessbyId(businessId: string): Promise<ILocation[] | null | number> {
        // Mirem si el id té un format vàlid
        if (!mongoose.Types.ObjectId.isValid(businessId)) {
            console.log(`Invalid ID format: ${businessId}`);
            return -1; 
        }
        const business = await Business.findById(businessId).populate<{ location: ILocation[] }>('location');
        if (business === null) {
            // El id no pertany a cap business
            return null; 
        }
        return business.location;
    }
    
    //Funció que retorna totes les locations d'un business que ofereixen un ServiceType concret
    async getAllLocationsFromBusinessbyServiceType(businessId: string, serviceType: string): Promise<ILocation[] | null | number> {
        // Mirem si el id té un format vàlid
        if (!mongoose.Types.ObjectId.isValid(businessId)) {
            return -1; 
        }
        // Mirem si el serviceType és vàlid (existex com a enum de locationServiceType)
        if (!Object.values(locationServiceType).includes(serviceType as locationServiceType)) {
            return -2; 
        }

        // Mirem si el ID pertany a algun business
        const business = await Business.findById(businessId).populate<{ location: ILocation[] }>('location');

        if (!business) {
            return null; 
        }
        
        // Filtrar les locations que ofereixen el serviceType concret
        const filteredLocations = business.location.filter(location =>
            location.serviceType.includes(serviceType as locationServiceType)
        );

        if(filteredLocations.length === 0) {
            return -3
        } // Retorna -3 si no hi ha locations que ofereixen el serviceType concret

        return filteredLocations; // Retorna las locations filtradas
    }


    //Funció que torna tots els business que en alguna de les seves locations s'ofereix un serviceType concret
    async getAllBusinesswithLocationofferingServiceType(serviceType: string): Promise<IBusiness[] | null | number> {
        // Verificar si el serviceType és vàlid (existeix com a enum de locationServiceType)
        if (!Object.values(locationServiceType).includes(serviceType as locationServiceType)) {
            return -1; // Retorna -1 si el serviceType no és vàlid
        }

        // Buscar totes les locations que ofereixen el serviceType concret
        const locations = await Location.find({ serviceType: serviceType });
        if (locations.length === 0) {
            return null; // Retorna null si no hi ha locations que ofereixen el serviceType
        }

        // Obtenir els IDs de les locations
        const locationIds = locations.map((location) => location._id);

        // Buscar tots els business que tenen alguna de les locations amb el serviceType concret
        const businesses = await Business.find({ location: { $in: locationIds }, isDeleted: false }).populate('location');

        return businesses; 
    }

    //Funció que crea un location i l'afegeix a la llista de locations del business
    async createLocationForBusiness(businessId: string, locationData: Partial<ILocation>): Promise<IBusiness | null | number> {
        // Verificar si el ID del business té un format vàlid
        if (!mongoose.Types.ObjectId.isValid(businessId)) {
            return -1;
        }
        // Buscar el business per ID
        const business = await Business.findById(businessId);
        if (!business) {
            return null; // Retorna null si no es troba el business
        }

        const location = await locationService.createLocation(locationData);

        if (location === -1) {
            return -2; // Ja existeix (nom o adreça duplicada)
        }
        if (location === 0) {
            return -3; // Schedule invàlid
        }
        if (location === 1) {
            return -4; // ServiceTypes invàlids
        }

        // Afegir la location al business
        if (typeof location !== 'number' && 'id' in location && location._id) {
            business.location.push(location._id);
            return await business.save();
        }
        return -4; // Retorna -4 si no es pot afegir la location al business
    }

    //Funció que elimina un location de business i de la base de dades
    async deleteLocationForBusiness(businessId: string, locationId: string): Promise<IBusiness | null | number> {
        // Verificar si el ID del business té un format vàlid
        if (!mongoose.Types.ObjectId.isValid(businessId)) {
            return -1; 
        }
        // Verificar si el ID de la location té un format vàlid
        if (!mongoose.Types.ObjectId.isValid(locationId)) {
            return -2; 
        }
        // Buscar el business per ID
        const business = await Business.findById(businessId);
        if (!business) {
            return null; 
        }
        // Verificar si la location existeix en el business
        const locationIndex = business.location.findIndex(
            (id) => id.toString() === locationId
        );
        if (locationIndex === -1) {
            return -3; 
        }
        // Eliminar la location del array de locations del business
        business.location.splice(locationIndex, 1);
        await business.save();

        // Eliminar la location de la base de dades
        const deletedLocation = await Location.findByIdAndDelete(locationId);
        if (!deletedLocation) {
            return -4; 
        }
        return business; 
    }

    //Funció que fa un softdelete de Business 
    async softDeleteBusiness(businessId: string): Promise<IBusiness | null | number> {
        // Verificar si el ID del business té un format vàlid
        if (!mongoose.Types.ObjectId.isValid(businessId)) {
            return -1; 
        }
        const foundBusiness = await Business.findById(businessId);
        if (!foundBusiness) {
            return null; 
        }
        // Actualitzar el camp isDeleted de totes les locations associades
        if (foundBusiness.location && foundBusiness.location.length > 0) {
            const locationIds = foundBusiness.location.map((loc) => loc._id);
            const updatedLocations = await Location.updateMany(
                { _id: { $in: locationIds } },
                { $set: { isDeleted: true } }
            );
            if (updatedLocations.modifiedCount !== locationIds.length) {
                return -2; // Retorna -2 si no s'han pogut actualitzar totes les locations
            }
        }
        // Actualitzar el camp isDeleted del business
        const updatedBusiness = await Business.findByIdAndUpdate(
            businessId,
            { $set: { isDeleted: true } },
            { new: true } 
        ).populate('location');

        return updatedBusiness;
    }

    //Funció que fa un harddelete de Business
    async hardDeleteBusiness(businessId: string): Promise<IBusiness | null | number> {
        // Verificar si el ID del business té un format vàlid
        if (!mongoose.Types.ObjectId.isValid(businessId)) {
            return -1; 
        }

        // Buscar el business per ID obviant el middleware que filtra els softdelayed
        const business = await Business.findOne({ _id: businessId }).setOptions({ bypassHooks: true });
        if (!business) {
            return null; 
        }

        // Eliminar totes les locations associades al business
        if (business.location && business.location.length > 0) {
            const locationIds = business.location.map((loc) => loc.toString());
            await Location.deleteMany({ _id: { $in: locationIds } });
        }

        // Eliminar el business
        const deletedBusiness = await Business.findByIdAndDelete(businessId);

        return deletedBusiness; 
    }
    

}
