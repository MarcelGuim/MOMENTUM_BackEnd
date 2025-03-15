import { Request, Response } from 'express';
import { IUsuari } from './user.model';
import { UserService } from './user.services';

const userService = new UserService();

export async function createUser(req:Request, res:Response): Promise<Response> {
    console.log("Creating user");
    try{
        const{name,age,mail,password} = req.body as IUsuari
        const newUser: Partial<IUsuari> = {name,age,mail,password,isDeleted:false};
        console.log("Creating user:", { name, age, mail, password });
        const user = await userService.createUser(newUser);
        if(user){
            return res.status(200).json({
                message:"Validate user in the email"
            });
        }
        else{
            return res.status(404).json({error: 'User not created, there has been an error'});
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
    const newUser: Partial<IUsuari> = { name, age, mail, password };
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
        const user = await userService.loginUser(name_or_mail, password);
        console.log("User trying to get logged in:", name_or_mail);

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

export async function getUsersPaginated(req: Request, res: Response): Promise<Response> {
  try {
    const page = parseInt(req.params.page) || 1;
    const result = await userService.getUsersPaginated(page, 5);
    if (result) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json({ error: 'No users found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}
