import { IUsuari } from './user.model';
import User from './user.model';
import Calendar from '../calendari/calendar.model';
import Appointment, { IAppointment } from '../appointment/appointment.model';
import nodemailer from 'nodemailer';
import * as crypto from 'node:crypto';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();
let activations: Partial<IUsuari>[] = [];

export class UserService {
  async createUser(user: Partial<IUsuari>): Promise<Number> {
    const result = await User.findOne({
      $or: [{ mail: user.mail }, { name: user.name }],
    });
    if (result) {
      return 0;
    } else {
      const id = crypto.randomBytes(20).toString('hex');
      user.activationId = id;
      if (user.mail === undefined) {
        return 1;
      }
      mailOptions.to = user.mail;
      activations.push(user);
      const baseURL =
        process.env.NODE_ENV === 'production'
          ? process.env.APP_BASE_URL // Use the URL from the environment for production
          : 'http://localhost:8080'; // Fallback to localhost in development
      mailOptions.text = `${baseURL}/users/activate/${user.name}/${id}`;

      mailOptions.text = `${baseURL}/users/activate/${user.name}/${id}`;
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error sending the email:', error);
          return 1;
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      return 2;
    }
  }

  async getUserById(userId: string): Promise<IUsuari | null> {
    return await User.findById(userId);
  }

  async updateUserById(
    userId: string,
    data: Partial<IUsuari>
  ): Promise<IUsuari | null> {
    console.log('Updating user at the service:', data, userId);
    return await User.findByIdAndUpdate(userId, data, { new: true });
  }

  async getUsersPaginated(
    page = 1,
    limit = 5,
    getDeleted = false
  ): Promise<{
    users: IUsuari[];
    totalPages: number;
    totalUsers: number;
    currentPage: number;
  } | null> {
    const users = await User.find(getDeleted ? {} : { isDeleted: false })
      .sort({ name: 1 })
      .skip(page * limit)
      .limit(limit);
    return {
      users,
      currentPage: page,
      totalUsers: await User.countDocuments(),
      totalPages: Math.ceil((await User.countDocuments()) / limit),
    };
  }

  async hardDeleteUserById(userId: string): Promise<IUsuari | null> {
    return await User.findByIdAndDelete(userId);
  }

  async softDeleteUserById(userId: string): Promise<IUsuari | null> {
    // 1. Soft delete the user
    const deletedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!deletedUser) return null;

    // 2. Find all calendars owned by this user
    const calendars = await Calendar.find(
      { owner: userId },
      { appointments: 1 } // Only get the appointments array
    );

    // 3. Extract all appointment IDs from these calendars
    const appointmentIds = calendars.flatMap(
      (c) => c.appointments as IAppointment[]
    );

    // 4. Execute all cascade operations
    await Promise.all([
      // Soft delete all user's calendars
      Calendar.updateMany({ owner: userId }, { $set: { isDeleted: true } }),

      // Soft delete all appointments (if any exist)
      ...(appointmentIds.length > 0
        ? [
            Appointment.updateMany(
              { _id: { $in: appointmentIds } },
              { $set: { isDeleted: true } }
            ),
          ]
        : []),

      // Remove user from any invitees lists
      Calendar.updateMany(
        { invitees: userId },
        { $pull: { invitees: userId } }
      ),
    ]);

    return deletedUser;
  }

  async softDeleteUsersByIds(userIds: string[]): Promise<number | null> {
    // 1. First soft delete the users
    const userResult = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { isDeleted: true } }
    );

    if (userResult.modifiedCount > 0) {
      // 2. Find all calendars owned by these users to get appointment references
      const calendars = await Calendar.find(
        { owner: { $in: userIds } },
        { appointments: 1, _id: 0 } // Only get appointments array
      );

      // Extract all appointment IDs from these calendars
      const appointmentIds = calendars.flatMap(
        (c) => c.appointments as IAppointment[]
      );

      // 3. Execute all cascade operations in parallel
      await Promise.all([
        // Soft delete all calendars owned by these users
        Calendar.updateMany(
          { owner: { $in: userIds } },
          { $set: { isDeleted: true } }
        ),
        // Soft delete all appointments from those calendars (if any exist)
        ...(appointmentIds.length > 0
          ? [
              Appointment.updateMany(
                { _id: { $in: appointmentIds } },
                { $set: { isDeleted: true } }
              ),
            ]
          : []),

        // Remove users from any invitees lists
        Calendar.updateMany(
          { invitees: { $in: userIds } },
          { $pull: { invitees: { $in: userIds } } }
        ),
      ]);
    }

    return userResult.modifiedCount;
  }

  async restoreUserById(userId: string): Promise<IUsuari | null> {
    return await User.findByIdAndUpdate(
      userId,
      { isDeleted: false },
      { new: true }
    );
  }

  async activateUser(name: string, id: string): Promise<IUsuari | null> {
    console.log('Activating user...');
    const index = activations.findIndex(
      (element) => element.name === name && element.activationId === id
    );

    if (index === -1) {
      return null;
    }

    const user = activations[index];
    activations.splice(index, 1);

    user.activationId = '';
    const userSaved = new User(user);
    return await userSaved.save();
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<IUsuari> {
    //const user = await User.findById(userId);
    const user = await User.findById(userId).select('+password');
    if (!user) throw new Error('UserNotFound');

    const valid = await user.isValidPassword(currentPassword);
    if (!valid) throw new Error('IncorrectPassword');

    user.password = newPassword; // el pre('save') se encarga del hash
    return await user.save();
  }

  async toggleFavoriteLocation(
    userId: string,
    locationId: string
  ): Promise<IUsuari | null> {
    const user = await User.findById(userId);
    if (!user) return null;

    const locationObjectId = new mongoose.Types.ObjectId(locationId);
    const alreadyFavorite = user.favoriteLocations?.some((loc) =>
      loc.equals(locationObjectId)
    );

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      alreadyFavorite
        ? { $pull: { favoriteLocations: locationObjectId } }
        : { $addToSet: { favoriteLocations: locationObjectId } },
      { new: true }
    );

    return updatedUser;
  }

  async findUsersByName(name: string): Promise<IUsuari[]> {
  const nameRegex = new RegExp(name, 'i');

  const users = await User.aggregate([
    {
      $match: {
        isDeleted: false,
        name: { $regex: nameRegex },
      },
    },
    {
      $project: {
        password: 0,
        activationId: 0,
      },
    },
  ]);

  return users;
 }

  async followUser(followerId: string, followeeId: string): Promise<IUsuari | null> {
      if (followerId === followeeId) {
        throw new Error("No puedes seguirte a ti mismo");
      }

      const follower = await User.findById(followerId);
      const followee = await User.findById(followeeId);

      if (!follower || !followee) {
        return null;
      }

      // Aseguramos que follower.following y followee.followers sean arrays
      follower.following = follower.following || [];
      followee.followers = followee.followers || [];

      // Comprobamos si ya está siguiendo para no duplicar
      const followeeIdObj = new mongoose.Types.ObjectId(followeeId);
      const followerIdObj = new mongoose.Types.ObjectId(followerId);

      if (follower.following.some(id => id.equals(followeeIdObj))) {
        // Ya está siguiendo, no hacemos nada
        return follower;
      }

      follower.following.push(followeeIdObj);
      followee.followers.push(followerIdObj);

      await follower.save();
      await followee.save();

      return follower;
  }

  async unfollowUser(followerId: string, followeeId: string): Promise<IUsuari | null> {
    if (followerId === followeeId) {
      throw new Error("No puedes dejar de seguirte a ti mismo");
    }

    const follower = await User.findById(followerId);
    const followee = await User.findById(followeeId);

    if (!follower || !followee) {
      return null;
    }

    follower.following = follower.following || [];
    followee.followers = followee.followers || [];

    const followeeIdObj = new mongoose.Types.ObjectId(followeeId);
    const followerIdObj = new mongoose.Types.ObjectId(followerId);

    // Filtramos para eliminar el followee de following del follower
    follower.following = follower.following.filter(id => !id.equals(followeeIdObj));

    // Filtramos para eliminar el follower de followers del followee
    followee.followers = followee.followers.filter(id => !id.equals(followerIdObj));

    await follower.save();
    await followee.save();

    return follower;
  }

}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'momentumea2025@gmail.com', // La teva adreça de correu
    pass: 'vlzf cjuw duop bnko', // La teva contrasenya (potser hauries d'utilitzar un "App Password" si tens 2FA activat)
  },
});

const mailOptions = {
  from: 'momentumea2025@gmail.com',
  to: '',
  subject: 'New user created',
  text: '',
};
