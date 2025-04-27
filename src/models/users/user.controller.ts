import { Request, Response } from 'express';
import { IUsuari } from './user.model';
import { UserService } from './user.services';

const userService = new UserService();

export async function createUser(req:Request, res:Response): Promise<Response> {
    console.log("Creating user");
    try{
        const{name,age,mail,password} = req.body as IUsuari
        const newUser: Partial<IUsuari> = {name,age,mail,password};
        console.log("Creating user:", { name, age, mail, password });
        const user = await userService.createUser(newUser);
        return res.status(200).json({
            message:"User Created",
            user
        });
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

export async function deleteUserByName(req:Request, res:Response): Promise<Response>{
    try{
        const{name} = req.params;
        const user = await userService.deleteUserByName(name);
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