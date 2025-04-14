import { Request, Response, Router } from 'express';
import { loginUser, refresh, logout,  googleAuthCtrl, googleAuthCallback } from './auth.controller';
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
router.post("/login", loginUser);

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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: Clears refresh token cookie
 *       500:
 *         description: Server error
 */
router.post('/logout', verifyToken, logout);

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth2 authentication
 *     tags: [Authentication]
 *     description: Redirects the user to Google's OAuth2 consent screen.
 *     responses:
 *       302:
 *         description: Redirects to Google's OAuth2 login page
 *       500:
 *         description: Server error due to missing configuration
 */
router.get('/google', googleAuthCtrl);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth2 callback
 *     tags: [Authentication]
 *     description: Handles the OAuth2 callback from Google and sets the authentication cookie.
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: The authorization code returned from Google
 *     responses:
 *       302:
 *         description: Redirects the user to the frontend with the access token
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: HTTP-only cookie with access token
 *       400:
 *         description: Missing authorization code
 *       500:
 *         description: Server error during Google authentication
 */
router.get('/google/callback', googleAuthCallback);

export default router;