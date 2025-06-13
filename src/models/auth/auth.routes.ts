import { Router } from 'express';
import {
  loginUser,
  refresh,
  logout,
  validateToken,
  validateLogin,
  registerBusiness,
  loginWorker,
} from './auth.controller';
import { verifyRefresh, verifyToken } from '../../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name_or_mail
 *               - password
 *             properties:
 *               name_or_mail:
 *                 type: string
 *               password:
 *                 type: string
 *               fcmToken:
 *                 type: string
 *                 description: Firebase token for push notifications
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 accessToken:
 *                   type: string
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
router.post('/login', loginUser);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
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
 *       401:
 *         description: Invalid or expired refresh token
 *       500:
 *         description: Server error
 */
router.post('/refresh', verifyRefresh, refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict
 *             description: Clears refresh token cookie
 *       500:
 *         description: Server error
 */
router.post('/logout', verifyRefresh, logout);

/**
 * @swagger
 * /auth/validate:
 *   get:
 *     summary: Validate access token and return associated user model
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isValid:
 *                   type: boolean
 *                   example: true
 *                 model:
 *                   type: string
 *                   description: Type of user model (e.g., USER, TREB)
 *                   example: USER
 *       401:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isValid:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                 code:
 *                   type: string
 */
router.get('/validate', verifyToken, validateToken);

/**
 * @swagger
 * /auth/validateLogin:
 *   get:
 *     summary: Validate if user or worker is logged in
 *     tags: [auth]
 *     responses:
 *       200:
 *         description: Hola
 */
router.get('/validateLogin', verifyToken, validateLogin);

/////////////////////////////////
// Business Part

/**
 * @swagger
 * /auth/registerBusiness:
 *   post:
 *     summary: Register a new business and its admin worker
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - mail
 *               - age
 *               - password
 *               - businessName
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the admin worker
 *                 example: John Doe
 *               mail:
 *                 type: string
 *                 description: Email of the admin worker
 *                 example: admin@example.com
 *               age:
 *                 type: number
 *                 description: Age of the admin worker
 *                 example: 35
 *               password:
 *                 type: string
 *                 description: Password for the admin worker
 *                 example: strongpassword123
 *               businessName:
 *                 type: string
 *                 description: Name of the business
 *                 example: Momentum Hair Salon
 *     responses:
 *       201:
 *         description: Business and admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Business and admin created successfully
 *                 business:
 *                   $ref: '#/components/schemas/Business'
 *                 admin:
 *                   $ref: '#/components/schemas/Worker'
 *       400:
 *         description: Invalid input or invalid locations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: There are 2 invalid locations when creating business
 *       409:
 *         description: Conflict (e.g., business or worker already exists)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: The business already exists
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to create business
 */
router.post('/registerBusiness', registerBusiness);

/**
 * @swagger
 * /auth/loginWorker:
 *   post:
 *     summary: Authenticate a worker
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mail
 *               - password
 *             properties:
 *               mail:
 *                 type: string
 *                 description: Email of the worker
 *                 example: worker@example.com
 *               password:
 *                 type: string
 *                 description: Password of the worker
 *                 example: strongpassword123
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 worker:
 *                   $ref: '#/components/schemas/Worker'
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: HTTP-only refresh token cookie
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid credentials
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to authenticate worker
 */
router.post('/loginWorker', loginWorker);

export default router;
