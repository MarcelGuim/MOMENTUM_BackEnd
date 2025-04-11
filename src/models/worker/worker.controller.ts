import { Request, Response } from 'express';
import { IWorker } from './worker.model';
import { WorkerService } from './worker.services';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt.utils';
import { LoginRequestBody } from '../../types';
import { worker, workers } from 'cluster';



const workerService = new WorkerService();
// PART AUTH
export const loginWorker = async (req: Request, res: Response) => {
  try {
    const { name_or_mail, password } = req.body as LoginRequestBody;
    const { worker, accessToken, refreshToken } = await workerService.loginWorker(name_or_mail, password);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    console.log('Sending refreshToken in cookie:', refreshToken);
    console.log('Sending accessToken in response:', { accessToken });

    return res.json({
      worker,
      accessToken // Store this in localStorage
    });
  } catch (error: any) {
    return res.status(401).json({ error: error.message });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const workerId = req.worker?._id;
    console.log('Extracted workerId:', workerId || 'UNDEFINED');

    if (!workerId) {
      console.error('Invalid token payload - missing workerId');
      throw new Error('Invalid token payload');
    }

    const { accessToken } = await workerService.refreshTokens(workerId.toString());
    
    console.log('Tokens generated:', {
      accessToken: accessToken ? `${accessToken.substring(0, 10)}...` : 'UNDEFINED',
    });

    console.log('Returning new accessToken to client');
    return res.json({ 
      accessToken,
      debug: process.env.NODE_ENV === 'development' ? {
        workerId,
        tokenExpiresIn: '15m' // Match your JWT expiry
      } : undefined
    });

  } catch (error: any) {
    console.error('Refresh failed:', {
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : 'HIDDEN IN PRODUCTION',
      timestamp: new Date().toISOString()
    });

    return res.status(401).json({ 
      error: error.message || 'Token refresh failed',
      ...(process.env.NODE_ENV === 'development' && {
        details: {
          suggestion: 'Check if worker exists and refresh token is valid',
          timestamp: new Date().toISOString()
        }
      })
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    console.log(`Worker ${req.worker?._id || 'UNKNOWN'} has logged out.`);
    res.clearCookie('refreshToken');
    return res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};


//PART CRUD
export async function createWorker(req:Request, res:Response): Promise<Response> {
    console.log("Creating worker");
    try{
        const{name,age,mail,password, empresa, role, } = req.body as IWorker
        const newWorker: Partial<IWorker> = {name,age,mail,password, empresa, role, isDeleted:false};
        console.log("Creating worker:", { name, age, mail, password });
        const worker = await workerService.createWorker(newWorker);
        if(worker===0){
          return res.status(409).json({error: 'Worker already exists'});
        }else if (worker === 1){
          return res.status(404).json({error: 'Worker not created, there has been an error'});
        }
        else{
          return res.status(200).json({
            message:"Validate worker in the email"
          });
            
        }
    }
    catch(error){
        return res.status(500).json({ error: 'Failed to create worker' });
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

export async function activateWorker(req: Request, res: Response): Promise<Response> {
  try {
    const { name, id } = req.params;
    const worker = await workerService.activateWorker(name, id);
    if (worker) {
      return res.status(200).json({
        message: "Worker activated",
        worker
      });
    } else {
      return res.status(404).json({ error: 'Worker not found or invalid activation' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to activate worker' });
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
