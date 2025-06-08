import Worker, { IWorker } from './worker.model';
import Calendar from '../calendari/calendar.model';
import Appointment, { IAppointment } from '../appointment/appointment.model';
import dotenv from 'dotenv';
import Location, { ILocation } from '../location/location.model';
import mongoose from 'mongoose';
import Business, { IBusiness } from '../business/business.model';

dotenv.config();

export class WorkerService {
  async createWorker(worker: Partial<IWorker>): Promise<IWorker | null> {
    const result = await Worker.findOne({
      $or: [{ mail: worker.mail }, { name: worker.name }],
    });
    if (result) return null;
    else {
      const newWorker = new Worker(worker);
      const savedWorker = await newWorker.save();
      console.log('Worker created successfully');
      await Location.findByIdAndUpdate(worker.location, {
        $push: { workers: savedWorker._id },
      });
      return savedWorker;
    }
  }

  async createWorkerByAdmin(
    worker: Partial<IWorker>,
    adminId: string,
    locationName: string
  ): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(adminId))
      throw new Error('Wrong worker ID format');
    const location: ILocation | null = await Location.findOne({
      nombre: locationName,
    });
    if (!location) throw new Error('Location not found');
    if (!location.id)
      throw new Error('Location not correctly saved, contact administrator');
    const result = await Worker.findOne({
      $or: [{ mail: worker.mail }, { name: worker.name }],
    });
    if (result) throw new Error('Worker already exists');
    const workerAdmin = await Worker.findById(adminId);
    if (!workerAdmin) throw new Error('Admin not found');
    if (!workerAdmin.businessAdministrated)
      throw new Error('Business administrated not found');
    const business: IBusiness | null = await Business.findById(
      workerAdmin.businessAdministrated
    );
    if (!business) throw new Error('Business not found');
    if (!business.location.includes(location.id))
      throw new Error("You don't manage that locations");
    worker.location = location.id;
    const newWorker = new Worker(worker);
    const savedWorker = await newWorker.save();
    await Location.findByIdAndUpdate(worker.location, {
      $push: { workers: savedWorker._id },
    });
  }

  async createWorkerWithMultipleLocations(
    worker: Partial<IWorker>,
    adminId: string
  ): Promise<IWorker | null> {
    // Check if the worker already exists by email or name
    if (!mongoose.Types.ObjectId.isValid(adminId))
      throw new Error('Wrong worker ID format');

    const existingWorker = await Worker.findOne({
      $or: [{ mail: worker.mail }, { name: worker.name }],
    });
    if (existingWorker) throw new Error('Worker already exists');

    // Validate all provided locations
    if (!worker.location || worker.location.length === 0) {
      throw new Error('At least one location must be provided');
    }

    const validLocations = await Location.find({
      _id: { $in: worker.location },
    });
    if (validLocations.length !== worker.location.length) {
      throw new Error('Some locations are invalid');
    }

    const workerAdmin = await Worker.findById(adminId);
    if (!workerAdmin) throw new Error('Admin not found');
    if (!workerAdmin.businessAdministrated)
      throw new Error('Business administrated not found');
    const business: IBusiness | null = await Business.findById(
      workerAdmin.businessAdministrated
    );
    if (!business) throw new Error('Business not found');
    worker.location?.forEach((location) => {
      if (!business.location.includes(location))
        throw new Error("You don't manage one of the locations");
    });
    // Create the worker
    const newWorker = new Worker(worker);
    const savedWorker = await newWorker.save();

    // Update all locations to include the worker
    await Location.updateMany(
      { _id: { $in: worker.location } },
      { $push: { workers: savedWorker._id } }
    );

    return savedWorker;
  }

  async getWorkerById(workerId: string): Promise<IWorker | null> {
    return await Worker.findById(workerId);
  }
  async updateWorkerById(
    workerId: string,
    data: Partial<IWorker>
  ): Promise<IWorker | null> {
    console.log('Updating user at the service:', data, workerId);
    return await Worker.findByIdAndUpdate(workerId, data, { new: true });
  }

  async getWorkersPaginated(
    page = 1,
    limit = 5,
    getDeleted = false
  ): Promise<{
    users: IWorker[];
    totalPages: number;
    totalUsers: number;
    currentPage: number;
  } | null> {
    const users = await Worker.find(getDeleted ? {} : { isDeleted: false })
      .sort({ name: 1 })
      .skip(page * limit)
      .limit(limit);
    return {
      users,
      currentPage: page,
      totalUsers: await Worker.countDocuments(),
      totalPages: Math.ceil((await Worker.countDocuments()) / limit),
    };
  }
  async getWorkerByCompany(company: string): Promise<{ workers: IWorker[] }> {
    const workers = await Worker.find({ empresa: company });
    return { workers };
  }
  async getWorkersPaginatedByCompany(
    page = 1,
    limit = 5,
    getDeleted = false,
    company: string
  ): Promise<{
    workers: IWorker[];
    totalPages: number;
    totalWorkers: number;
    currentPage: number;
  } | null> {
    const workers = await Worker.find(getDeleted ? {} : { isDeleted: false }, {
      empresa: company,
    })
      .sort({ name: 1 })
      .skip(page * limit)
      .limit(limit);
    return {
      workers,
      currentPage: page,
      totalWorkers: await Worker.countDocuments(),
      totalPages: Math.ceil((await Worker.countDocuments()) / limit),
    };
  }
  async hardDeleteWorkerById(workerId: string): Promise<IWorker | null> {
    return await Worker.findByIdAndDelete(workerId);
  }
  async softDeleteWorkerById(workerId: string): Promise<IWorker | null> {
    // 1. Soft delete the user
    const deletedUser = await Worker.findByIdAndUpdate(
      workerId,
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!deletedUser) return null;

    // 2. Find all calendars owned by this user
    const calendars = await Calendar.find(
      { owner: workerId },
      { appointments: 1 } // Only get the appointments array
    );

    // 3. Extract all appointment IDs from these calendars
    const appointmentIds = calendars.flatMap(
      (c) => c.appointments as IAppointment[]
    );

    // 4. Execute all cascade operations
    await Promise.all([
      // Soft delete all user's calendars
      Calendar.updateMany({ owner: workerId }, { $set: { isDeleted: true } }),

      // Soft delete all appointments (if any exist)
      ...(appointmentIds.length > 0
        ? [
            Appointment.updateMany(
              { _id: { $in: appointmentIds } },
              { $set: { isDeleted: true } }
            ),
          ]
        : []),

      // Remove user from any invitees lists
      Calendar.updateMany(
        { invitees: workerId },
        { $pull: { invitees: workerId } }
      ),
    ]);

    return deletedUser;
  }
  async softDeleteWorkerByIds(workerIds: string[]): Promise<number | null> {
    // 1. First soft delete the users
    const workerResult = await Worker.updateMany(
      { _id: { $in: workerIds } },
      { $set: { isDeleted: true } }
    );

    if (workerResult.modifiedCount > 0) {
      // 2. Find all calendars owned by these users to get appointment references
      const calendars = await Calendar.find(
        { owner: { $in: workerIds } },
        { appointments: 1, _id: 0 } // Only get appointments array
      );

      // Extract all appointment IDs from these calendars
      const appointmentIds = calendars.flatMap(
        (c) => c.appointments as IAppointment[]
      );

      // 3. Execute all cascade operations in parallel
      await Promise.all([
        // Soft delete all calendars owned by these users
        Calendar.updateMany(
          { owner: { $in: workerIds } },
          { $set: { isDeleted: true } }
        ),
        // Soft delete all appointments from those calendars (if any exist)
        ...(appointmentIds.length > 0
          ? [
              Appointment.updateMany(
                { _id: { $in: appointmentIds } },
                { $set: { isDeleted: true } }
              ),
            ]
          : []),

        // Remove users from any invitees lists
        Calendar.updateMany(
          { invitees: { $in: workerIds } },
          { $pull: { invitees: { $in: workerIds } } }
        ),
      ]);
    }

    return workerResult.modifiedCount;
  }
  async restoreWorkerById(userId: string): Promise<IWorker | null> {
    return await Worker.findByIdAndUpdate(
      userId,
      { isDeleted: false },
      { new: true }
    );
  }

  async getWorkersByBusinessId(businessId: string): Promise<IWorker[]> {
    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      throw new Error('Invalid business ID format');
    }

    // Find the business and populate locations and their workers
    const business = await Business.findById(businessId).populate({
      path: 'location',
      populate: {
        path: 'workers',
        model: 'Worker',
      },
    });

    if (!business) {
      throw new Error('Business not found');
    }

    // Extract workers from all locations
    const workers = business.location.flatMap(
      (location: any) => location.workers
    );

    return workers;
  }
}
