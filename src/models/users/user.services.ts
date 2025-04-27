import {IUsuari} from './user.model';
import User from './user.model';

export class UserService {
  async createUser(data: Partial<IUsuari>): Promise<IUsuari> {
    const user = new User(data);
    console.log("Creating user at the service:", user);
    return await user.save();
  }
  async getUserByName(name: string): Promise<IUsuari | null> {
    return await User.findOne({name});
  }  

  async deleteUserByName(name: string): Promise<IUsuari | null> {
    return await User.findOneAndDelete({name});
  }

  async updateUserByName(name: string, data: Partial<IUsuari>): Promise<IUsuari | null> {
    console.log("Updating user at the service:", data, name);
    return await User.findOneAndUpdate({ name }, data, { new: true });
  }

  async loginUser(name:string, password:string): Promise<boolean | null>{
    const user2: Partial<IUsuari> | null = await User.findOne({name: name}).select('name password');
    console.log("user2 is: " +user2);
    if(user2 === null){
        console.log("User not found")
        return null;
    }
    else if(user2.password === password){
        console.log("Correct user and password")
        return true;
    }
    else{
        console.log("The password was incorrect")
        return false;
    }
  }
}

