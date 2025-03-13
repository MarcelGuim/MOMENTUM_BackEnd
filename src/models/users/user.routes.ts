import { Request, Response, Router } from 'express';
import { userValidationRules, userValidator } from './user.validation';

const router = Router();

import { createUser, getUserByName, hardDeleteUserByName, updateUserByName, loginUser, diguesHola, restoreUserByName, softDeleteUserByName, getUsersPaginated, activateUser } from './user.controller';

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
 *     summary: Elimina un usuario por nombre (Hard delete)
 *     tags: [users]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: El nombre del usuario a eliminar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Fallo al eliminar el usuario
 */
router.delete('/:name', hardDeleteUserByName);

/**
 * @swagger
 * /users/soft/{name}:
 *   patch:
 *     summary: Elimina un usuario lógicamente por nombre (Soft delete)
 *     tags: [users]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: El nombre del usuario a eliminar lógicamente
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario marcado como no disponible
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Fallo al marcar el usuario como no disponible
 */
router.patch('/soft/:name', softDeleteUserByName);

/**
 * @swagger
 * /users/restore/{name}:
 *   patch:
 *     summary: Restaura un usuario marcado como no disponible (Soft undelete)
 *     tags: [users]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: El nombre del usuario a restaurar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario restaurado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Fallo al restaurar el usuario
 */
router.patch('/restore/:name', restoreUserByName);

/**
 * @swagger
 * /users/page/{page}:
 *   get:
 *     summary: Obtiene usuarios paginados
 *     tags: [users]
 *     description: Retorna una lista de usuarios en bloques de 5 o 10.
 *     parameters:
 *       - in: path
 *         name: page
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número de usuarios por página (opcional, por defecto 5)
 *     responses:
 *       200:
 *         description: Lista de usuarios paginada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *       500:
 *         description: Error en el servidor
 */
router.get('/page/:page',getUsersPaginated);

export default router;
