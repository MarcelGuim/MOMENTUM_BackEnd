import { Request, Response } from 'express';
import { IUsuari } from './user.model';
import User from './user.model';
import { UserService } from './user.services';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt.utils';
import admin from 'firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';

const userService = new UserService();

//PART CRUD
export async function createUser(
  req: Request,
  res: Response
): Promise<Response> {
  console.log('Creating user');
  try {
    const { name, age, mail, password } = req.body as IUsuari;
    const newUser: Partial<IUsuari> = {
      name,
      age,
      mail,
      password,
      isDeleted: false,
    };
    const user = await userService.createUser(newUser);
    if (user === 0) {
      return res.status(409).json({ error: 'User already exists' });
    } else if (user === 1) {
      return res
        .status(404)
        .json({ error: 'User not created, there has been an error' });
    } else {
      return res.status(200).json({
        message: 'Validate user in the email',
      });
    }
  } catch {
    return res.status(500).json({ error: 'Failed to create user' });
  }
}

export async function getUserById(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { userId } = req.params;
    const user = await userService.getUserById(userId);
    if (user) {
      return res.status(200).json(user);
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch {
    return res.status(500).json({ error: 'Failed to get user' });
  }
}

export async function updateUserById(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userId = req.params.userId;
    const updateData: Partial<IUsuari> = req.body;

    // Only hash password if it was provided and not empty
    if (updateData.password && updateData.password.trim() !== '') {
      updateData.password = await bcrypt.hash(
        updateData.password,
        bcrypt.genSaltSync(8)
      );
    } else {
      // Remove password field if empty or not provided
      delete updateData.password;
    }

    const user = await userService.updateUserById(userId, updateData);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({
      error: 'Failed to update user',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function refreshUser(
  req: Request,
  res: Response
): Promise<Response> {
  const id = req.userPayload?.userId;
  if (!id) return res.status(400);
  else {
    const user: IUsuari | null = await userService.getUserById(id);
    return res.status(200).json(user);
  }
}

export async function hardDeleteUserById(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { userId } = req.params;
    const user = await userService.hardDeleteUserById(userId);
    if (user) {
      return res.status(200).json({
        message: 'User deleted',
        user,
      });
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch {
    return res.status(500).json({ error: 'Failed to delete user' });
  }
}

export async function softDeleteUserById(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { userId } = req.params;
    const user = await userService.softDeleteUserById(userId);
    if (user) {
      return res.status(200).json({
        message: 'User soft deleted',
        user,
      });
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch {
    return res.status(500).json({ error: 'Failed to soft delete user' });
  }
}
export async function softDeleteUsersByIds(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    console.log('Body recibido;', req.body);
    const { usersIds } = req.body;
    if (!Array.isArray(usersIds) || usersIds.length === 0) {
      return res.status(400).json({ error: 'Invalid format' });
    }
    const usersNum = usersIds.length;
    const result = await userService.softDeleteUsersByIds(usersIds);
    if (result === usersNum) {
      return res.status(200).json({
        message: 'All Users soft deleted',
      });
    } else {
      return res
        .status(404)
        .json({ error: `Only ${result} users soft deleted successfully` });
    }
  } catch {
    return res.status(500).json({ error: 'Failed to soft delete user' });
  }
}

export async function restoreUserById(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { userId } = req.params;
    const user = await userService.restoreUserById(userId);
    if (user) {
      return res.status(200).json({
        message: 'User restored',
        user,
      });
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch {
    return res.status(500).json({ error: 'Failed to restore user' });
  }
}

export async function activateUser(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { name, id } = req.params;
    const user = await userService.activateUser(name, id);
    if (user) {
      return res.status(200).json({
        message: 'User activated',
        user,
      });
    } else {
      return res
        .status(404)
        .json({ error: 'User not found or invalid activation' });
    }
  } catch {
    return res.status(500).json({ error: 'Failed to activate user' });
  }
}

type PaginatedUsersQueryParams = {
  page: number;
  limit: number | undefined;
  getDeleted: string | undefined;
};

export async function getUsersPaginated(
  req: Request<{}, {}, {}, PaginatedUsersQueryParams>,
  res: Response
): Promise<Response> {
  try {
    const page = req.query.page;
    const limit = req.query.limit ?? 5;
    const getDeleted = req.query.getDeleted == 'true';

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

export async function changePassword(
  req: Request,
  res: Response
): Promise<Response> {
  console.log('Request body:', req.body);
  console.log('Params:', req.params);
  const { userId } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await userService.changePassword(
      userId,
      currentPassword,
      newPassword
    );
    return res.status(200).json({
      message: 'Password updated successfully',
      user,
    });
  } catch (err: any) {
    if (err.message === 'UserNotFound') {
      return res.status(404).json({ error: 'User not found' });
    }
    if (err.message === 'IncorrectPassword') {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Failed to update password' });
  }
}

export async function toggleFavoriteLocationController(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { userId, locationId } = req.params;

    if (!userId || !locationId) {
      return res.status(400).json({
        message: 'Missing userId or locationId in request parameters',
      });
    }

    const updatedUser = await userService.toggleFavoriteLocation(
      userId,
      locationId
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ message: 'User not found or failed to update favorites' });
    }

    return res.status(200).json({
      message: 'Favorite location updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating favorite location:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function findUsersByName(req: Request, res: Response): Promise<Response> {
  try {
    const { name } = req.query;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Invalid name parameter' });
    }

    const users = await userService.findUsersByName(name);
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error finding users by name:', error);
    return res.status(500).json({ error: 'Failed to find users' });
  }
}

export async function followUser(req: Request, res: Response) {
  try {
    const { followerId, followeeId } = req.params;

    if (followerId === followeeId) {
      return res.status(400).json({ message: "No puedes seguirte a ti mismo" });
    }

    const user = await userService.followUser(followerId, followeeId);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({ message: "Usuario seguido correctamente", user });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}

export async function unfollowUser(req: Request, res: Response) {
  try {
    const { followerId, followeeId } = req.params;

    if (followerId === followeeId) {
      return res.status(400).json({ message: "No puedes dejar de seguirte a ti mismo" });
    }

    const user = await userService.unfollowUser(followerId, followeeId);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({ message: "Usuario dejado de seguir correctamente", user });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}
export async function sendFriendRequest(req: Request, res: Response) {
  const fromId = req.userPayload?.userId;
  const { toId } = req.body;

  if (!fromId || !toId) {
    return res.status(400).json({ error: 'Falten dades: fromId o toId' });
  }

  try {
    const result = await userService.sendFriendRequest(fromId, toId);

    if (!result) {
      return res.status(404).json({ error: 'Usuari no trobat o ja afegit' });
    }

    const { toUser, fromUser } = result;

    if (toUser.fcmToken) {
      await getMessaging().send({
        token: toUser.fcmToken,
        notification: {
          title: 'Nova sol·licitud d\'amistat',
          body: `Tens una nova sol·licitud de ${fromUser.mail}`,
        },
        data: {
          type: 'friend_request',
          fromId,
          fromEmail: fromUser.mail,
        }
      });
    }
    return res.json({ message: 'Sol·licitud enviada' });
  } catch (error) {
    console.error('Error enviant la sol·licitud:', error);
    return res.status(500).json({ error: 'Error en enviar la sol·licitud' });
  }
}


export async function acceptFriendRequest(req: Request, res: Response) {
  const toId = req.userPayload?.userId;
  const { fromId } = req.body;

  if (!toId || !fromId) {
    return res.status(400).json({ error: 'Falten dades: toId o fromId' });
  }

  try {
    const result = await userService.acceptFriendRequest(toId, fromId);
    if (!result) return res.status(404).json({ error: 'Usuari no trobat' });

    const fromUser = await User.findById(fromId);
    if (fromUser?.fcmToken) {
      await getMessaging().send({
        token: fromUser.fcmToken,
        notification: {
          title: 'Amistat acceptada',
          body: `${result.mail} ha acceptat la teva sol·licitud d'amistat`,
        },
        data: {
          type: 'friend_accept',
          toId
        }
      });
    }

    return res.json({ message: 'Amistat acceptada' });
  } catch (error) {
    console.error('Error acceptant amistat:', error);
    return res.status(500).json({ error: 'Error intern acceptant la sol·licitud' });
  }
}


export async function getFriendRequests(req: Request, res: Response) {
  const userId = req.userPayload?.userId;
  if (!userId) return res.status(400).json({ error: 'Falta userId a token' });

  try {
    const requests = await userService.getFriendRequests(userId);
    return res.json({ requests });
  } catch (error) {
    console.error("Error obtenint les sol·licituds d'amistat:", error);
    return res.status(500).json({ error: 'Error intern del servidor' });
  }
}


export async function searchUsersByEmailFragment(req: Request, res: Response) {
  const emailFragment = req.body.q as string;
  const currentUserId = req.userPayload?.userId;

  if (!emailFragment) {
    return res.status(400).json({ error: "Missing email fragment." });
  }
  if (!currentUserId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const results = await userService.searchUsersByEmailFragment(currentUserId, emailFragment);
    return res.json({ users: results });
  } catch (error) {
    console.error('Error buscant usuaris per fragment de correu:', error);
    return res.status(500).json({ error: 'Error intern del servidor' });
  }
}

export async function denyFriendRequest(req: Request, res: Response) {
  const toId = req.params.userId; 
  const { fromId } = req.body;

  if (!toId || !fromId) {
    return res.status(400).json({ error: 'Falten dades: toId o fromId' });
  }

  try {
    const success = await userService.denyFriendRequest(toId, fromId);
    if (!success) {
      return res.status(404).json({ error: 'Usuari receptor no trobat' });
    }

    return res.json({ message: 'Sol·licitud d\'amistat rebutjada' });
  } catch (error) {
    console.error('Error rebutjant sol·licitud:', error);
    return res.status(500).json({ error: 'Error intern rebutjant la sol·licitud' });
  }
}
export async function getFriends(req: Request, res: Response) {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ error: 'Falta userId' });
  }

  try {
    const friends = await userService.getFriendsByUserId(userId);
    return res.json({ friends });
  } catch (error) {
    console.error('Error obtenint amics:', error);
    return res.status(500).json({ error: 'Error intern obtenint amics' });
  }
}
export async function removeFriend(req: Request, res: Response) {
  const { userId, friendId } = req.params;

  if (!userId || !friendId) {
    return res.status(400).json({ error: 'Falten dades: userId o friendId' });
  }

  try {
    const result = await userService.removeFriend(userId, friendId);
    if (!result) {
      return res.status(404).json({ error: 'No s\'ha pogut eliminar l\'amistat' });
    }

    return res.json({ message: 'Amistat eliminada correctament' });
  } catch (error) {
    console.error('Error eliminant amistat:', error);
    return res.status(500).json({ error: 'Error intern eliminant amistat' });
  }
}

