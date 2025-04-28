// cal modificar certes parts per localitzacions varies i empreses, mirar imatge, sobretot pel tema serveis. Els que hi ha s'han de complir tot i això.

import Worker, {IWorker} from './worker.model';
import Calendar from '../calendari/calendar.model';
import Appointment from '../appointment/appointment.model';
import * as crypto from "node:crypto";
import e from 'express';
import dotenv from 'dotenv';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt.utils';
import Location from '../location/location.model';

dotenv.config();

export class WorkerService {
    async createWorker(worker: Partial<IWorker>): Promise<IWorker | null> {
        const result = await Worker.findOne({$or: [{ mail: worker.mail }, { name: worker.name }]});
        if(result) return null;
        else
        {
          const newWorker = new Worker(worker);
          const savedWorker = await newWorker.save();
          console.log("Worker created successfully");
          await Location.findByIdAndUpdate(worker.location, { $push: { workers: savedWorker._id } });
          return savedWorker;
        }
    }
    async getWorkerById(workerId: string): Promise<IWorker | null> {
        return await Worker.findById(workerId);
    }
    async updateWorkerById(workerId: string, data: Partial<IWorker>): Promise<IWorker | null> {
        console.log("Updating user at the service:", data, workerId);
        return await Worker.findByIdAndUpdate(workerId, data, { new: true });
    
    }
    async getWorkersPaginated(page = 1, limit = 5, getDeleted = false): Promise<{ users: IWorker[]; totalPages: number; totalUsers: number, currentPage: number } | null> {
        const users = await Worker.find(getDeleted ? {} : {isDeleted: false})
          .sort({ name: 1 })
          .skip(page * limit)
          .limit(limit);
        return {
          users,
          currentPage: page,
          totalUsers: await Worker.countDocuments(),
          totalPages: Math.ceil(await Worker.countDocuments() / limit),
        };
    }
    async getWorkerByCompany(company: string): Promise<{workers: IWorker[]}> {
        const workers = await Worker.find({empresa: company});
        return {workers};
    }
    async getWorkersPaginatedByCompany(page = 1, limit = 5, getDeleted = false, company: string): Promise<{ workers: IWorker[]; totalPages: number; totalWorkers: number, currentPage: number } | null> {
        const workers = await Worker.find(getDeleted ? {} : {isDeleted: false}, {empresa: company})
          .sort({ name: 1 })
          .skip(page * limit)
          .limit(limit);
        return {
          workers,
          currentPage: page,
          totalWorkers: await Worker.countDocuments(),
          totalPages: Math.ceil(await Worker.countDocuments() / limit),
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
        const appointmentIds = calendars.flatMap(c => c.appointments);
      
        // 4. Execute all cascade operations
        await Promise.all([
          // Soft delete all user's calendars
          Calendar.updateMany(
            { owner: workerId },
            { $set: { isDeleted: true } }
          ),
          
          // Soft delete all appointments (if any exist)
          ...(appointmentIds.length > 0 ? [
            Appointment.updateMany(
              { _id: { $in: appointmentIds } },
              { $set: { isDeleted: true } }
            )
          ] : []),
          
          // Remove user from any invitees lists
          Calendar.updateMany(
            { invitees: workerId },
            { $pull: { invitees: workerId } }
          )
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
          const appointmentIds = calendars.flatMap(c => c.appointments);
      
          // 3. Execute all cascade operations in parallel
          await Promise.all([
            // Soft delete all calendars owned by these users
            Calendar.updateMany(
              { owner: { $in: workerIds } },
              { $set: { isDeleted: true } }
            ),   
            // Soft delete all appointments from those calendars (if any exist)
            ...(appointmentIds.length > 0 ? [
              Appointment.updateMany(
                { _id: { $in: appointmentIds } },
                { $set: { isDeleted: true } }
              )
            ] : []),
            
            // Remove users from any invitees lists
            Calendar.updateMany(
              { invitees: { $in: workerIds } },
              { $pull: { invitees: { $in: workerIds } } }
            )
          ]);
        }
      
        return workerResult.modifiedCount;
    }

    async restoreWorkerById(userId: string): Promise<IWorker | null> {
        return await Worker.findByIdAndUpdate(userId, { isDeleted: false }, { new: true });
    }

}
