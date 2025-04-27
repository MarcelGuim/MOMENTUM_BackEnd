import { Request, Response, Router } from 'express';
import { userValidationRules, userValidator } from './user.validation';
import { verifyRefresh, authenticate } from '../../middleware/auth.middleware';

const router = Router();

import { 
  createUser, 
  getUserById, 
  hardDeleteUserById, 
  updateUserById, 
  loginUser, 
  diguesHola, 
  restoreUserById, 
  softDeleteUserById,
  softDeleteUsersByIds,
  getUsersPaginated, 
  activateUser,
  refresh,
  logout 
} from './user.controller';

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
router.get("/Hola", diguesHola);

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
router.post("", userValidationRules(), userValidator, createUser);

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
router.get("/activate/:name/:id", activateUser);

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
router.get("/:userId",getUserById);

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
router.put("/:userId", userValidationRules(), userValidator, updateUserById);

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
router.delete("/:userId", hardDeleteUserById);

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
router.patch("/:userId/soft", softDeleteUserById);

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
router.patch("/soft", softDeleteUsersByIds);

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
router.patch("/:userId/restore", restoreUserById);

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
router.get("",getUsersPaginated);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name_or_mail, password]
 *             properties:
 *               name_or_mail:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "securePassword123"
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: HTTP-only refresh token cookie
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /users/refresh:
 *   post:
 *     summary: Refresh access token using a valid refresh token
 *     description: |
 *       Generates a new access token while maintaining the original refresh token.
 *       Requires the refresh token to be sent as an HTTP-only cookie.
 *     tags: [Authentication]
 *     security: []  # No Bearer token needed (uses cookie)
 *     responses:
 *       200:
 *         description: New access token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: New short-lived JWT access token
 *                   example: "eyJhbGciOiJIUzI..."
 *                 debug: 
 *                   type: object
 *                   description: Only present in development environment
 *                   properties:
 *                     userId:
 *                       type: string
 *                     tokenExpiresIn: 
 *                       type: string
 *                       example: "15m"
 *                   x-example: { userId: "507f1f77bcf86cd799439011", tokenExpiresIn: "15m" }
 *       401:
 *         description: |
 *           Failure scenarios:
 *           - Invalid refresh token
 *           - Missing user ID in payload
 *           - User account not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Token refresh failed"
 *                 details:
 *                   type: object
 *                   description: Only present in development
 *                   properties:
 *                     suggestion:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                   x-example: { suggestion: "Check refresh token validity", timestamp: "2023-11-21T12:00:00Z" }
 *       500:
 *         description: Internal server error
 */
router.post('/refresh', verifyRefresh, refresh);

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Log out user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: Clears the refresh token cookie
 *       500:
 *         description: Server error
 */
router.post('/logout', authenticate, logout);

export default router;