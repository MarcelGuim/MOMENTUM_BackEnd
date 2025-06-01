import { Request, Response } from 'express';
import { IWorker } from './worker.model';
import { WorkerService } from './worker.services';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt.utils';
import { LoginRequestBody } from '../../types';
import { worker, workers } from 'cluster';



const workerService = new WorkerService();

//PART CRUD
export async function createWorker(req:Request, res:Response): Promise<Response> {
    console.log("Creating worker");
    try{
        const adminId = req.userPayload?.userId;
        if (!adminId) return res.status(405).json({ message: "Invalid worker ID format" });
        const worker:Partial<IWorker> = req.body.worker as IWorker
        console.log(worker);
        worker.isDeleted = false;
        const locationName = req.body.location;
        if(!locationName) return res.status(405).json({ error: "Location not sent"});
        console.log(locationName);
        await workerService.createWorkerByAdmin(worker, adminId, locationName.toString());
        return res.status(201);
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        console.log((error as { message: string }).message);
        return res.status(405).json({ error: (error as { message: string }).message });
      }
      return res.status(500).json({ message: "Failed to create location for business, server error" });
    }
}

export async function getWorkerById(req: Request, res: Response): Promise<Response> {
  try {
    const { workerId } = req.params;
    const worker = await workerService.getWorkerById(workerId);
    if (worker) {
      return res.status(200).json(worker);
    } else {
      return res.status(404).json({ error: 'Worker not found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get worker' });
  }
}

export async function updateWorkerById(req: Request, res: Response): Promise<Response> {
  try {
    const workerId = req.params.workerId;
    const updateData: Partial<IWorker> = req.body;

    // Only hash password if it was provided and not empty
    if (updateData.password && updateData.password.trim() !== '') {
      updateData.password = await bcrypt.hash(updateData.password, bcrypt.genSaltSync(8));
    } else {
      // Remove password field if empty or not provided
      delete updateData.password;
    }

    const worker = await workerService.updateWorkerById(workerId, updateData);
    
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    
    return res.status(200).json({
      message: "Worker updated successfully"
    });

  } catch (error) {
    console.error('Error updating worker:', error);
    return res.status(500).json({ 
      error: 'Failed to update worker',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function diguesHola(req: Request, res: Response): Promise<Response> {
  console.log("Hola");
  return res.status(200).json({ message: "Hola" });
}

export async function hardDeleteWorkerById(req: Request, res: Response): Promise<Response> {
  try {
    const { workerId } = req.params;
    const worker = await workerService.hardDeleteWorkerById(workerId);
    if (worker) {
      return res.status(200).json({
        message: "Worker deleted",
        worker
      });
    } else {
      return res.status(404).json({ error: 'Worker not found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete worker' });
  }
}

export async function softDeleteWorkerById(req: Request, res: Response): Promise<Response> {
  try {
    const { workerId } = req.params;
    const worker = await workerService.softDeleteWorkerById(workerId);
    if (worker) {
      return res.status(200).json({
        message: "Worker soft deleted",
        worker
      });
    } else {
      return res.status(404).json({ error: 'Worker not found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to soft delete worker' });
  }
}
export async function softDeleteWorkersByIds(req: Request, res: Response): Promise<Response> {
  try {
    console.log("Body recibido;", req.body)
    const { workersIds } = req.body;
    if (!Array.isArray(workersIds) || workersIds.length === 0) {
      return res.status(400).json({ error: 'Invalid format' });
    }
    const workersNum = workersIds.length;
    const result = await workerService.softDeleteWorkerByIds(workersIds);
    if (result === workersNum) {
      return res.status(200).json({
        message: "All Workers soft deleted",
      });
    } else {
      return res.status(404).json({ error: `Only ${result} workers soft deleted successfully` });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to soft delete worker' });
  }
}

export async function restoreWorkerById(req: Request, res: Response): Promise<Response> {
  try {
    const { workerId } = req.params;
    const worker = await workerService.restoreWorkerById(workerId);
    if (worker) {
      return res.status(200).json({
        message: "Worker restored",
        worker
      });
    } else {
      return res.status(404).json({ error: 'Worker not found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to restore worker' });
  }
}

type PaginatedWorkersQueryParams = {
  page: number,
  limit: number | undefined,
  getDeleted: string | undefined,
}

export async function getWorkersPaginated(req: Request<{}, {}, {}, PaginatedWorkersQueryParams>, res: Response): Promise<Response> {
  try {
    const page = req.query.page;
    const limit = req.query.limit ?? 5;
    const getDeleted = req.query.getDeleted == "true";

    const result = await workerService.getWorkersPaginated(page, limit, getDeleted);
    if (result) {
      console.log(result);
      return res.status(200).json(result);
    } else {
      return res.status(404).json({ error: 'No workers found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch workers' });
  }

}

export async function getWorkersByCompany(req: Request, res: Response): Promise<Response> {
  try {
    const { company } = req.params;
    const workers = await workerService.getWorkerByCompany(company);
    if (workers) {
      return res.status(200).json(workers);
    } else {
      return res.status(404).json({ error: 'No workers found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get workers' });
  }
}
export async function getWorkersPaginatedByCompany(req: Request, res: Response): Promise<Response> {    
    try {
        const page = parseInt(req.query.page as string, 10);
        const limit = parseInt(req.query.limit as string) ?? 5;
        const getDeleted = req.query.getDeleted == "true";
        const { company } = req.params;
        const result = await workerService.getWorkersPaginatedByCompany(page, limit, getDeleted, company);
        if (result) {
        console.log(result);
        return res.status(200).json(result);
        } else {
        return res.status(404).json({ error: 'No workers found' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to fetch workers' });
    }
    
}
