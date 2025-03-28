import { Request, Response } from 'express';
import { IUsuari } from './user.model';
import { UserService } from './user.services';
import bcrypt from 'bcrypt';

const userService = new UserService();

export async function createUser(req:Request, res:Response): Promise<Response> {
    console.log("Creating user");
    try{
        const{name,age,mail,password} = req.body as IUsuari
        const newUser: Partial<IUsuari> = {name,age,mail,password,isDeleted:false};
        console.log("Creating user:", { name, age, mail, password });
        const user = await userService.createUser(newUser);
        if(user===0){
          return res.status(409).json({error: 'User already exists'});
        }else if (user === 1){
          return res.status(404).json({error: 'User not created, there has been an error'});
        }
        else{
          return res.status(200).json({
            message:"Validate user in the email"
          });
            
        }
    }
    catch(error){
        return res.status(500).json({ error: 'Failed to create user' });
    }
}

export async function getUserById(req: Request, res: Response): Promise<Response> {
  try {
    const { userId } = req.params;
    const user = await userService.getUserById(userId);
    if (user) {
      return res.status(200).json(user);
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get user' });
  }
}

export async function updateUserById(req: Request, res: Response): Promise<Response> {
  console.log("Updating user");
  try {
    const userId = req.params.userId;
    console.log("ID of the user to update:", userId);
    const { name, age, mail, password } = req.body as IUsuari;
    const hashedPassword = await bcrypt.hash(password, bcrypt.genSaltSync(8));
    const newUser: Partial<IUsuari> = { name, age, mail, password: hashedPassword };
    const user = await userService.updateUserById(userId, newUser);
    if (user) {
      return res.status(200).json({
        message: "User updated correctly",
        user
      });
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user' + error });
  }
}

export async function loginUser(req: Request, res: Response): Promise<Response> {
    console.log("Logging in user");
    try {
        const { name_or_mail, password } = req.body;
        console.log("User trying to get logged in:", name_or_mail);
        const user = await userService.loginUser(name_or_mail, password);
        if (user === true) {
            return res.status(200).json({
                message: "User logged in",
            });
        } else {
            // Return a generic error message for both incorrect password and non-existent user
            return res.status(401).json({ error: 'Invalid username/mail or password' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to login user' });
    }
}

export async function diguesHola(req: Request, res: Response): Promise<Response> {
  console.log("Hola");
  return res.status(200).json({ message: "Hola" });
}

export async function hardDeleteUserById(req: Request, res: Response): Promise<Response> {
  try {
    const { userId } = req.params;
    const user = await userService.hardDeleteUserById(userId);
    if (user) {
      return res.status(200).json({
        message: "User deleted",
        user
      });
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete user' });
  }
}

export async function softDeleteUserById(req: Request, res: Response): Promise<Response> {
  try {
    const { userId } = req.params;
    const user = await userService.softDeleteUserById(userId);
    if (user) {
      return res.status(200).json({
        message: "User soft deleted",
        user
      });
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to soft delete user' });
  }
}
export async function softDeleteUsersByIds(req: Request, res: Response): Promise<Response> {
  try {
    console.log("Body recibido;", req.body)
    const { usersIds } = req.body;
    if (!Array.isArray(usersIds) || usersIds.length === 0) {
      return res.status(400).json({ error: 'Invalid format' });
    }
    const usersNum = usersIds.length;
    const result = await userService.softDeleteUsersByIds(usersIds);
    if (result === usersNum) {
      return res.status(200).json({
        message: "All Users soft deleted",
      });
    } else {
      return res.status(404).json({ error: `Only ${result} users soft deleted successfully` });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to soft delete user' });
  }
}

export async function restoreUserById(req: Request, res: Response): Promise<Response> {
  try {
    const { userId } = req.params;
    const user = await userService.restoreUserById(userId);
    if (user) {
      return res.status(200).json({
        message: "User restored",
        user
      });
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to restore user' });
  }
}

export async function activateUser(req: Request, res: Response): Promise<Response> {
  try {
    const { name, id } = req.params;
    const user = await userService.activateUser(name, id);
    if (user) {
      return res.status(200).json({
        message: "User activated",
        user
      });
    } else {
      return res.status(404).json({ error: 'User not found or invalid activation' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to activate user' });
  }
}

type PaginatedUsersQueryParams = {
  page: number,
  limit: number | undefined,
  getDeleted: string | undefined,
}

export async function getUsersPaginated(req: Request<{}, {}, {}, PaginatedUsersQueryParams>, res: Response): Promise<Response> {
  try {
    const page = req.query.page;
    const limit = req.query.limit ?? 5;
    const getDeleted = req.query.getDeleted == "true";

    const result = await userService.getUsersPaginated(page, limit, getDeleted);
    if (result) {
      console.log(result);
      return res.status(200).json(result);
    } else {
      return res.status(404).json({ error: 'No users found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}
