import { Router } from 'express';
import { userValidationRules, userValidator,} from '../../middleware/user.validation';
import { changePasswordValidator } from '../../middleware/changePasswordValidation';
import { requireOwnership, verifyToken } from '../../middleware/auth.middleware';

const router = Router();

import {
  createUser,
  getUserById,
  hardDeleteUserById,
  updateUserById,
  refreshUser,
  restoreUserById,
  softDeleteUserById,
  softDeleteUsersByIds,
  getUsersPaginated,
  activateUser,
  changePassword,
  toggleFavoriteLocationController,
  findUsersByName,
  followUser,
  unfollowUser,
  sendFriendRequest,
  acceptFriendRequest,
  getFriendRequests,
  searchUsersByEmailFragment,
  denyFriendRequest,
  getFriends,
  removeFriend,
} from './user.controller';

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Buscar usuarios por nombre
 *     description: Devuelve una lista de usuarios cuyo nombre coincide parcial o totalmente con el parámetro dado.
 *     tags: [users]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Nombre o parte del nombre del usuario a buscar
 *     responses:
 *       200:
 *         description: Lista de usuarios encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *         description: Parámetro de búsqueda inválido
 *       500:
 *         description: Error interno del servidor
 */
router.get("/search", findUsersByName);

/**
 * @swagger
 * /users/Hola:
 *   get:
 *     summary: Obtenir un Hola
 *     tags: [res]
 *     responses:
 *       200:
 *         description: Hola
 */
router.get('/refreshUser', verifyToken, refreshUser);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Register a new user
 *     tags: [users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               mail:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User Created
 *       500:
 *         description: Failed to create user
 */
router.post('', userValidationRules(), userValidator, createUser);

/**
 * @swagger
 * /users/validate/{name}/{id}:
 *   post:
 *     summary: Valida un nou usuari
 *     tags: [users]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: El nombre del usuario a validar
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         description: El id del usuario a validar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario validado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Fallo al validar el usuario
 */
router.get('/activate/:name/:id', activateUser);

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get user by ID
 *     tags: [users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to get user
 */
router.get('/:userId', verifyToken, requireOwnership('userId'), getUserById);

/**
 * @swagger
 * /users/{userId}/password:
 *   put:
 *     summary: Change user password
 *     tags: [users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose password is being changed
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: The user’s current password
 *               newPassword:
 *                 type: string
 *                 description: The new password (min. 6 characters)
 *             required:
 *               - currentPassword
 *               - newPassword
 *           example:
 *             currentPassword: oldPass123
 *             newPassword: newPass456
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Current password is incorrect
 *       404:
 *         description: User not found
 *       422:
 *         description: Validation error (e.g., missing fields or too short newPassword)
 *       500:
 *         description: Server error
 */
router.put('/:userId/password', verifyToken, requireOwnership('userId'), changePasswordValidator, changePassword);

/**
 * @swagger
 * /users/{userId}:
 *   put:
 *     summary: Update user by ID
 *     tags: [users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               mail:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to update user
 */
router.put('/:userId', verifyToken, requireOwnership('userId'), userValidationRules(), userValidator, updateUserById );

/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     summary: Delete user by ID (hard delete)
 *     tags: [users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to delete user
 */
router.delete('/:userId', hardDeleteUserById);

/**
 * @swagger
 * /users/{userId}/soft:
 *   patch:
 *     summary: Soft delete user by ID
 *     tags: [users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to soft delete
 *     responses:
 *       200:
 *         description: User soft deleted
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to soft delete user
 */
router.patch('/:userId/soft', softDeleteUserById);

/**
 * @swagger
 * /users/soft:
 *   patch:
 *     summary: Soft delete users by Ids
 *     tags: [users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usersIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of user Ids to soft delete
 *     responses:
 *       200:
 *         description: Users soft deleted successfully
 *       400:
 *         description: Invalid or missing user emails format
 *       404:
 *         description: Some users not found or already deleted
 *       500:
 *         description: Failed to soft delete users
 */
router.patch('/soft', softDeleteUsersByIds);

/**
 * @swagger
 * /users/{userId}/restore:
 *   patch:
 *     summary: Restore a soft-deleted user by ID
 *     tags: [users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to restore
 *     responses:
 *       200:
 *         description: User restored
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to restore user
 */
router.patch('/:userId/restore', restoreUserById);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get paginated users
 *     tags: [users]
 *     parameters:
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of users per page (default 5)
 *     responses:
 *       200:
 *         description: Paginated users
 *       500:
 *         description: Server error
 */
router.get('', getUsersPaginated);

/**
 * @swagger
 * /users/{userId}/favorites/{locationId}:
 *   patch:
 *     summary: Add or remove a favorite location for the user
 *     tags: [users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the location to add or remove from favorites
 *     responses:
 *       200:
 *         description: Favorite location toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Favorite updated
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:userId/favorites/:locationId', toggleFavoriteLocationController);

/**
 * @swagger
 * /users/follow/{followerId}/{followeeId}:
 *   post:
 *     summary: Seguir a un usuario
 *     tags: [users]
 *     parameters:
 *       - in: path
 *         name: followerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario que sigue
 *       - in: path
 *         name: followeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario a seguir
 *     responses:
 *       200:
 *         description: Usuario seguido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario seguido correctamente
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Error en la solicitud (por ejemplo, seguirse a uno mismo)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No puedes seguirte a ti mismo
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/follow/:followerId/:followeeId', followUser);

/**
 * @swagger
 * /users/unfollow/{followerId}/{followeeId}:
 *   post:
 *     summary: Dejar de seguir a un usuario
 *     tags: [users]
 *     parameters:
 *       - in: path
 *         name: followerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario que deja de seguir
 *       - in: path
 *         name: followeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario al que se deja de seguir
 *     responses:
 *       200:
 *         description: Usuario dejado de seguir correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario dejado de seguir correctamente
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Error en la solicitud (por ejemplo, dejar de seguirse a uno mismo)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No puedes dejar de seguirte a ti mismo
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/unfollow/:followerId/:followeeId', unfollowUser);
/**
 * @swagger
 * /users/{userId}/friend-request:
 *   post:
 *     summary: Enviar una sol·licitud d'amistat a un usuari
 *     tags: [users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del remitent (usuari que fa la petició)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               toId:
 *                 type: string
 *                 description: ID del destinatari de la sol·licitud
 *     responses:
 *       200:
 *         description: Sol·licitud enviada correctament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sol·licitud enviada
 *       404:
 *         description: Usuari no trobat o ja afegit
 */
router.post('/:userId/friend-request', verifyToken, sendFriendRequest);

/**
 * @swagger
 * /users/{userId}/accept-friend:
 *   post:
 *     summary: Acceptar una sol·licitud d'amistat
 *     tags: [users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l’usuari que accepta la sol·licitud
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fromId:
 *                 type: string
 *                 description: ID de l’usuari que va enviar la sol·licitud
 *     responses:
 *       200:
 *         description: Amistat acceptada correctament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Amistat acceptada
 *       404:
 *         description: Usuari no trobat
 */
router.post('/:userId/accept-friend', verifyToken, acceptFriendRequest);

/**
 * @swagger
 * /users/{userId}/friend-requests:
 *   get:
 *     summary: Consultar sol·licituds d'amistat pendents
 *     tags: [users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l’usuari autenticat
 *     responses:
 *       200:
 *         description: Llista de sol·licituds pendents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 requests:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       mail:
 *                         type: string
 *       404:
 *         description: Usuari no trobat
 */
router.get('/:userId/friend-requests', verifyToken, requireOwnership('userId'), getFriendRequests);

router.post('/search-by-email', verifyToken, searchUsersByEmailFragment);

router.post('/:userId/deny-friend', verifyToken, denyFriendRequest);

router.get('/:userId/friends', verifyToken, getFriends);

router.delete('/friends/:userId/remove/:friendId', verifyToken, removeFriend);

export default router;
