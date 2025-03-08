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
}