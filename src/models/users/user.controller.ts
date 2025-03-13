import { Request, Response } from 'express';
import { IUsuari } from './user.model';
import { UserService } from './user.services';

const userService = new UserService();

export async function createUser(req:Request, res:Response): Promise<Response> {
    console.log("Creating user");
    try{
        const{name,age,mail,password} = req.body as IUsuari
        const newUser: IUsuari = {name,age,mail,password,isDeleted:false};
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


export async function getUserByName(req:Request, res:Response): Promise<Response>{
    try{
        const{name} = req.params;
        const user = await userService.getUserByName(name);
        if(user){
            return res.status(200).json(user);
        }
        else{
            return res.status(404).json({error: 'User not found'});
        }
    }
    catch(error){
        return res.status(500).json({ error: 'Failed to get user' });
    }
}

export async function updateUserByName(req:Request, res:Response): Promise<Response>{
    console.log("Updating user");
    try{
        const name1 = req.params.name;
        console.log("Name of the user to update:", name1);
        const{name,age,mail,password} = req.body as IUsuari;
        const newUser: Partial<IUsuari> = {name,age,mail,password};
        const user = await userService.updateUserByName(name1,newUser);
        if(user){
            return res.status(200).json({
                message: "User updated correctly",
                user
            });
        }
        else{
            return res.status(404).json({error: 'User not found'});
        }
    }
    catch(error){
        return res.status(500).json({ error: 'Failed to update user' + error});
    }
}

export async function loginUser(req:Request, res:Response): Promise<Response>{
    console.log("Logging in user");
    try{
        const{name,password} = req.body as IUsuari;
        const user = await userService.loginUser(name,password);
        console.log("User trying to get logged in:", name, password);
        if(user === true){
            return res.status(200).json({
                message: "User logged in",
            });
        }
        else if(user === false){
            return res.status(401).json({error: 'Incorrect password'});
        }
        else{
            return res.status(404).json({error: 'User not found'});
        }
    }
    catch(error){
        return res.status(500).json({ error: 'Failed to login user'});
    }
}

export async function diguesHola(req:Request, res:Response): Promise<Response>{
    console.log("Hola");
    return res.status(200).json({message: "Hola"});
}

// DELETES
export async function hardDeleteUserByName(req:Request, res:Response): Promise<Response>{
    try{
        const{name} = req.params;
        const user = await userService.hardDeleteUserByName(name);
        if(user){
            return res.status(200).json({
                message: "User deleted",
                user
            });
        }
        else{
            return res.status(404).json({error: 'User not found'});
        }
    }
    catch(error){
        return res.status(500).json({ error: 'Failed to delete user' });
    }
}

export async function softDeleteUserByName(req: Request, res: Response): Promise<Response> {
    try {
        const { name } = req.params;
        const user = await userService.softDeleteUserByName(name);
        if (user) {
            return res.status(200).json({
                message: "User soft deleted (marked as unavailable)",
                user
            });
        } else {
            return res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to soft delete user' });
    }
}

export async function restoreUserByName(req: Request, res: Response): Promise<Response> {
    try {
        const { name } = req.params;
        const user = await userService.restoreUserByName(name);
        if (user) {
            return res.status(200).json({
                message: "User restored (marked as available)",
                user
            });
        } else {
            return res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to restore user' });
    }
}

export async function getUsersPaginated(req:Request, res:Response): Promise<Response>{
    try{
        const page = parseInt(req.query.page as string) ||1;
        const limit = parseInt(req.query.limit as string) || 5;
        const users = await userService.getUsersPaginated(page,limit);
        if(users){
            return res.status(200).json(users);
        }
        else{
            return res.status(404).json({error: 'Users not found'});
        }
    }
    catch(error){
        return res.status(500).json({ error: 'Failed to get users' });
    }
}

export async function activateUser(req:Request, res:Response): Promise<Response>{
    try{
        const { name, id } = req.params;
        console.log(name,id);
        const user = await userService.activateUser(name,id);
        if(user){
            return res.status(200).json(user);
        }
        else{
            return res.status(404).json({error: 'Users not found'});
        }
    }
    catch(error){
        return res.status(500).json({ error: 'Failed to activate users' });
    }
}