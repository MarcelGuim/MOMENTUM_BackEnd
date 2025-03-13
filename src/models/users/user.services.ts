import {IUsuari} from './user.model';
import User from './user.model';
import nodemailer from 'nodemailer';
import * as crypto from "node:crypto";
import e from 'express';

let activations: Partial<IUsuari>[] = [];

export class UserService {
  async createUser(user: Partial<IUsuari>): Promise<Boolean> {
    console.log("Activations PRE: " + activations.length);
    const id = crypto.randomBytes(20).toString('hex');
    user.activationId = id;
    if(user.mail === undefined){
      return false;
    }
    mailOptions.to=user.mail;
    console.log("Creating user at the service:", user);
    activations.push(user);
    mailOptions.text="The activation link is: http://localhost:8080/users/activate/"+user.name+"/"+id;//Link d'activació per localhost
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending the email:', error);
        return false;
      } else {
        console.log('Email sent: ' + info.response);
        console.log("Activations POST: " + activations.length);
      }
    });
    return true;
  }
  async getUserByName(name: string): Promise<IUsuari | null> {
    return await User.findOne({name});
  }  

  async updateUserByName(name: string, data: Partial<IUsuari>): Promise<IUsuari | null> {
    console.log("Updating user at the service:", data, name);
    return await User.findOneAndUpdate({ name }, data, { new: true });
  }

  async loginUser(name:string, password:string): Promise<boolean | null>{
    const user2 = await User.findOne({name: name}).select('name password');
    console.log("user2 is: " +user2);
    if(user2 === null){
        console.log("User not found")
        return null;
    }
    const isMatch : boolean = await user2.isValidPassword(password);
    if(isMatch){
        console.log("Correct user and password")
        return true;
    }
    else{
        console.log("The password was incorrect")
        return false;
    }
  }

  async getUsersPaginated(page = 1, limit = 5): Promise<{users: IUsuari[]; totalPages:number; currentPage:number} | null> {
    const users = await User.find()
      .skip((page - 1) * limit)
      .sort({ name: 1 })
      .limit(limit);
    return {users, currentPage:page, totalPages: Math.ceil(await User.countDocuments() / limit),};
  }

  // Hard delete:
  async hardDeleteUserByName(name: string): Promise<IUsuari | null> {
    return await User.findOneAndDelete({name});
  }

  // Soft delete:
  async softDeleteUserByName(name: string): Promise<IUsuari | null> {
    return await User.findOneAndUpdate(
      { name }, 
      { isDeleted: true },
      { new: true } 
    );
  }

  // Soft undelete:
  async restoreUserByName(name: string): Promise<IUsuari | null> {
    return await User.findOneAndUpdate(
      { name }, 
      { isDeleted: false },
      { new: true }
    );
  }
  
  async activateUser(name: string, id: string): Promise<IUsuari | null>{
      console.log(activations.length);
      let user:Partial<IUsuari> | void = activations.find((element) => {
        if(element.name === name && element.activationId === id){
          return element;
        }
      });
      if(user === null || user === undefined){
        return null;
      }
      user.activationId = "";
      const userSaved = new User(user);
      return await userSaved.save();
  }
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'momentumea2025@gmail.com', // La teva adreça de correu
    pass: 'vlzf cjuw duop bnko'       // La teva contrasenya (potser hauries d'utilitzar un "App Password" si tens 2FA activat)
  }
});

const mailOptions = {
  from: 'momentumea2025@gmail.com',
  to: '',
  subject: 'New user created',
  text: ''
};
