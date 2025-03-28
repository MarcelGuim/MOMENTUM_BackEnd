import {IUsuari} from './user.model';
import User from './user.model';
import nodemailer from 'nodemailer';
import * as crypto from "node:crypto";
import e from 'express';
import dotenv from 'dotenv';

dotenv.config();
let activations: Partial<IUsuari>[] = [];

export class UserService {
  async createUser(user: Partial<IUsuari>): Promise<Number> {
    const result = await User.findOne({$or: [{ mail: user.mail }, { name: user.name }]});
    if (result) {
      return 0;
    } else {
      console.log("Activations PRE: " + activations.length);
      const id = crypto.randomBytes(20).toString('hex');
      user.activationId = id;
      if(user.mail === undefined){
        return 1;
      }
      mailOptions.to=user.mail;
      console.log("Creating user at the service:", user);
      activations.push(user);
      const baseURL = process.env.NODE_ENV === 'production' 
        ? process.env.APP_BASE_URL  // Use the URL from the environment for production
        : 'http://localhost:8080';   // Fallback to localhost in development
      mailOptions.text = `${baseURL}/users/activate/${user.name}/${id}`;
  
      mailOptions.text = `${baseURL}/users/activate/${user.name}/${id}`; 
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error sending the email:', error);
          return 1;
        } else {
          console.log('Email sent: ' + info.response);
          console.log("Activations POST: " + activations.length);
        }
      });
      return 2;
    }
    
  }

  async getUserById(userId: string): Promise<IUsuari | null> {
    return await User.findById(userId);
  }

  async updateUserById(userId: string, data: Partial<IUsuari>): Promise<IUsuari | null> {
    console.log("Updating user at the service:", data, userId);
    return await User.findByIdAndUpdate(userId, data, { new: true });

  }

  async loginUser(identifier:string, password:string): Promise<boolean | null>{
    const isEmail = identifier.includes('@');
    const query = isEmail ? { mail: identifier } : { name: identifier };
    const user = await User.findOne(query).select('name mail password');
    if(user === null){
        console.log("User not found")
        return null;
    }
    const isMatch : boolean = await user.isValidPassword(password);
    if(isMatch){
        console.log("Correct user and password")
        return true;
    }
    else{
        console.log("The password was incorrect")
        return false;
    }
  }

  async getUsersPaginated(page = 1, limit = 5, getDeleted = false): Promise<{ users: IUsuari[]; totalPages: number; totalUsers: number, currentPage: number } | null> {
    const users = await User.find(getDeleted ? {} : {isDeleted: false})
      .sort({ name: 1 })
      .skip(page * limit)
      .limit(limit);
      users.forEach((user) => {
        user.password = "";
      });
    return {
      users,
      currentPage: page,
      totalUsers: await User.countDocuments(),
      totalPages: Math.ceil(await User.countDocuments() / limit),
    };
  }

  async hardDeleteUserById(userId: string): Promise<IUsuari | null> {
    return await User.findByIdAndDelete(userId);
  }

  async softDeleteUserById(userId: string): Promise<IUsuari | null> {
    return await User.findByIdAndUpdate(userId, { isDeleted: true }, { new: true });
  }

  async softDeleteUsersByIds(userIds: string[]): Promise<number | null> {
    console.log(userIds);
    const result = await User.updateMany({ _id: { $in: userIds }}, {$set:{ isDeleted: true }});
    return result.modifiedCount
  }

  async restoreUserById(userId: string): Promise<IUsuari | null> {
    return await User.findByIdAndUpdate(userId, { isDeleted: false }, { new: true });
  }

  async activateUser(name: string, id: string): Promise<IUsuari | null> {
    console.log(activations.length);
    let user: Partial<IUsuari> | void = activations.find((element) => {
      if (element.name === name && element.activationId === id) {
        return element;
      }
    });
    if (user === null || user === undefined) {
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
