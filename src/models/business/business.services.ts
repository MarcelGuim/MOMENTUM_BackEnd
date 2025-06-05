import Business, { IBusiness } from "./business.model";
import Location, { ILocation } from "../location/location.model";
import User from '../users/user.model';
import mongoose from "mongoose";
import { locationServiceType } from '../../enums/locationServiceType.enum';
import { LocationService } from "../location/location.services";
import { FilterOptions, LocationFilter } from '../../interfaces/filter.interface';
import Worker from '../worker/worker.model';

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
    async createLocationForBusiness(workerId: string, locationData: Partial<ILocation>): Promise<void> {
        if (!mongoose.Types.ObjectId.isValid(workerId)) throw new Error("Wrong worker ID format");
        const worker = await Worker.findById(workerId);
        if (!worker) throw new Error("Worker not found");
        if (!worker.businessAdministrated) throw new Error("Wrong business id for the administrator");
        var newLocation: ILocation = new Location(locationData);;
        newLocation.business = worker.businessAdministrated;
        const location = await locationService.createLocation(newLocation);
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
    
    async getFilteredBusinesses(filters: FilterOptions): Promise<IBusiness[] | number | null> {
      // Primer filtrem les ubicacions que compleixen els criteris
      const locationFilter: any = { isDeleted: false };

      if (filters.serviceTypes) {
        const invalid = filters.serviceTypes.some(
          type => !Object.values(locationServiceType).includes(type as locationServiceType)
        );
        if (invalid) return -1;
        locationFilter.serviceType = { $in: filters.serviceTypes };
      }

      if (filters.cities && filters.cities.length > 0) {
        locationFilter.$or = filters.cities.map(city => ({
          address: {
            $regex: `\\d{5}\\s+${city}(,|$)`,
            $options: 'i',
          },
        }));
      }

      if (filters.ratingMin !== undefined && !isNaN(filters.ratingMin)) {
        locationFilter.rating = { $gte: filters.ratingMin };
      }

      if (filters.day && filters.time) {
        locationFilter.schedule = {
          $elemMatch: {
            day: filters.day,
            open: { $lte: filters.time },
            close: { $gt: filters.time },
          },
        };
      }

      if (
        filters.lat !== undefined && !isNaN(filters.lat) &&
        filters.lon !== undefined && !isNaN(filters.lon) &&
        filters.maxDistance !== undefined && !isNaN(filters.maxDistance)
      ) {
        locationFilter.ubicacion = {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates: [filters.lon, filters.lat],
            },
            $maxDistance: filters.maxDistance * 1000, // metres
          },
        };
      }

      const validLocations = await Location.find(locationFilter, { _id: 1 });

      if (validLocations.length === 0) return null;

      const locationIds = validLocations.map(loc => loc._id);
      //recuperem només els negocis amb ubicacions filtrades
      const businesses = await Business.aggregate([
        { $match: { isDeleted: false } },
        {
          $lookup: {
            from: 'locations',
            localField: 'location',
            foreignField: '_id',
            as: 'location',
          },
        },
        {
          $addFields: {
            location: {
              $filter: {
                input: "$location",
                as: "loc",
                cond: { $in: ["$$loc._id", locationIds] },
              },
            },
          },
        },
        {
          $match: {
            "location.0": { $exists: true }, // Només negocis amb ubicació vàlida
          },
        },
      ]);

      if (!businesses || businesses.length === 0) return null;

      return businesses;
    }

    async findBusinessOrByLocationName(name: string): Promise<IBusiness[] | null> {
      
      const nameRegex = new RegExp(name, 'i');

      const result = await Business.aggregate([
        {
          $match: {
            isDeleted: false,
            name: { $regex: nameRegex } // primer intentem match per nom de business
          }
        },
        {
          $lookup: {
            from: 'locations',
            localField: 'location',
            foreignField: '_id',
            as: 'location',
            pipeline: [
              { $match: { isDeleted: false } }
            ]
          }
        }
      ]);
    
      // Si hi ha resultats pel nom del business, retornem aquests
      if (result.length > 0) return result;
    
      // Si no, provem match per nom de location i només popularem la location concreta
      const businessesByLocation = await Business.aggregate([
        {
          $match: {
            isDeleted: false
          }
        },
        {
          $lookup: {
            from: 'locations',
            localField: 'location',
            foreignField: '_id',
            as: 'location',
            pipeline: [
              {
                $match: {
                  isDeleted: false,
                  nombre: { $regex: nameRegex }
                }
              }
            ]
          }
        },
        {
          $match: {
            location: { $ne: [] } // només els que han populat la location amb èxit
          }
        }
      ]);
    
      return businessesByLocation.length > 0 ? businessesByLocation : null;  
    }

    async getBusinessesWithFavoriteLocations(userId: string): Promise<IBusiness[] | null> {
      const user = await User.findById(userId).select('favoriteLocations');
    
      if (!user || user.favoriteLocations.length === 0) return [];
    
      const pipeline = [
        { $match: { isDeleted: false } },
        {
          $lookup: {
            from: 'locations',
            localField: 'location',
            foreignField: '_id',
            as: 'location',
            pipeline: [
              {
                $match: {
                  _id: { $in: user.favoriteLocations },
                  isDeleted: false,
                },
              },
            ],
          },
        },
        {
          $match: {
            location: { $ne: [] }, // només negocis amb alguna location populada (que coincideixi amb favorites)
          },
        },
      ];
    
      const result = await Business.aggregate(pipeline);
      return result.length > 0 ? result : null;
    }

    async getFilteredFavoriteBusinesses(userId: string, filters: FilterOptions): Promise<IBusiness[] | number | null> {
    const locationFilter: any = { isDeleted: false };

    //Obtenim l’usuari
    const user = await User.findById(userId).select('favoriteLocations');
    if (!user || !user.favoriteLocations || user.favoriteLocations.length === 0) return null;

    //Preparem els filtres
    if (filters.serviceTypes) {
      const invalid = filters.serviceTypes.some(
        type => !Object.values(locationServiceType).includes(type as locationServiceType)
      );
      if (invalid) return -1;
      locationFilter.serviceType = { $in: filters.serviceTypes };
    }

    if (filters.cities && filters.cities.length > 0) {
      locationFilter.$or = filters.cities.map(city => ({
        address: {
          $regex: `\\d{5}\\s+${city}(,|$)`,
          $options: 'i',
        },
      }));
    }

    if (filters.ratingMin !== undefined && !isNaN(filters.ratingMin)) {
      locationFilter.rating = { $gte: filters.ratingMin };
    }

    if (filters.day && filters.time) {
      locationFilter.schedule = {
        $elemMatch: {
          day: filters.day,
          open: { $lte: filters.time },
          close: { $gt: filters.time },
        },
      };
    }

    //Filtratge amb distància
    if (
      filters.lat !== undefined && !isNaN(filters.lat) &&
      filters.lon !== undefined && !isNaN(filters.lon) &&
      filters.maxDistance !== undefined && !isNaN(filters.maxDistance)
    ) {
      locationFilter.ubicacion = {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [filters.lon, filters.lat],
          },
          $maxDistance: filters.maxDistance * 1000, // metres
        },
      };
    }

    //Obtenim només les localitzacions favorites que compleixen els filtres
    const validLocations = await Location.find({
      _id: { $in: user.favoriteLocations },
      ...locationFilter,
    }, { _id: 1 });

    if (validLocations.length === 0) return null;

    const locationIds = validLocations.map(loc => loc._id);

    //Ara busquem els negocis que tenen aquestes ubicacions
    const businesses = await Business.aggregate([
      { $match: { isDeleted: false } },
      {
        $lookup: {
          from: 'locations',
          localField: 'location',
          foreignField: '_id',
          as: 'location',
        },
      },
      {
        $addFields: {
          location: {
            $filter: {
              input: "$location",
              as: "loc",
              cond: { $in: ["$$loc._id", locationIds] },
            },
          },
        },
      },
      {
        $match: { "location.0": { $exists: true } }, // només negocis amb ubicació vàlida
      },
    ]);

    return businesses.length > 0 ? businesses : null;
  }

}
