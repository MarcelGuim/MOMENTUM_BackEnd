import { Request, Response, Router } from 'express';
import { userValidationRules, userValidator } from './user.validation';

const router = Router();

import { createUser, getUserByName, deleteUserByName, updateUserByName, loginUser, diguesHola } from './user.controller';

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
 * /users/register:
 *   post:
 *     summary: Registra un nou usuari
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   age:
 *                     type: number
 *                   mail:
 *                     type: string
 *                   password:
 *                     type: string
 *       500:
 *         description: Failed to create user
 */
router.post("/register",userValidationRules(),userValidator, createUser);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Inicia sessió d'un usuari
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in
 *       401:
 *         description: Incorrect password
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to login user
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /users/{name}:
 *   get:
 *     summary: Obtenir les dades d'un usuari per nom
 *     tags: [users]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: El nom de l'usuari
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: Usuari no trobat
 *       500:
 *         description: Failed to get user
 */
router.get('/:name', getUserByName);

/**
 * @swagger
 * /users/{name}:
 *   put:
 *     summary: Actualitza les dades d'un usuari
 *     tags: [users]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: El nom de l'usuari
 *         schema:
 *           type: string
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
 *         description: User updated correctly
 *       400:
 *         description: User not found
 *       500:
 *         description: Failed to update user
 */
router.put('/:name', userValidationRules(),userValidator, updateUserByName);

/**
 * @swagger
 * /users/{name}:
 *   delete:
 *     summary: Elimina un usuari per nom
 *     tags: [users]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: El nom de l'usuari a eliminar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to delete user
 */
router.delete('/:name', deleteUserByName);

export default router;
