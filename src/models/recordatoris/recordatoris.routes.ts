import { Router } from 'express';

import RecordatorisController from './recordatoris.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Recordatoris
 *   description: API per gestionar recordatoris
 */

/**
 * @swagger
 * /recordatoris:
 *   post:
 *     summary: Crear un nou recordatori
 *     tags: [Recordatoris]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Recordatori'
 *     responses:
 *       201:
 *         description: Recordatori creat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recordatori'
 *       400:
 *         description: Error de validació o dades invàlides
 */
router.post('/', RecordatorisController.create);

/**
 * @swagger
 * /recordatoris/user/{userId}:
 *   get:
 *     summary: Obtenir tots els recordatoris d'un usuari
 *     tags: [Recordatoris]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'usuari
 *     responses:
 *       200:
 *         description: Llista de recordatoris
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recordatori'
 *       400:
 *         description: Error
 */
router.get('/user/:userId', RecordatorisController.findAll);

/**
 * @swagger
 * /recordatoris/{id}:
 *   get:
 *     summary: Obtenir un recordatori per ID
 *     tags: [Recordatoris]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del recordatori
 *     responses:
 *       200:
 *         description: Recordatori trobat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recordatori'
 *       404:
 *         description: No trobat
 */
router.get('/:id', RecordatorisController.findById);

/**
 * @swagger
 * /recordatoris/{id}:
 *   put:
 *     summary: Actualitzar un recordatori
 *     tags: [Recordatoris]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del recordatori
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Propietats a actualitzar
 *             properties:
 *               user:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               time:
 *                 type: string
 *                 format: date-time
 *               repeat:
 *                 type: string
 *                 enum:
 *                   - NEVER
 *                   - DAILY
 *                   - WEEKLY
 *                   - MONTHLY
 *                   - YEARLY
 *             example:
 *               title: "Nou títol"
 *               description: "Nova descripció"
 *               time: "2025-07-01T12:00:00Z"
 *               repeat: "WEEKLY"
 *     responses:
 *       200:
 *         description: Recordatori actualitzat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recordatori'
 *       400:
 *         description: Error de validació o dades invàlides
 */
router.put('/:id', RecordatorisController.update);

/**
 * @swagger
 * /recordatoris/{id}:
 *   delete:
 *     summary: Esborrar un recordatori
 *     tags: [Recordatoris]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del recordatori
 *     responses:
 *       204:
 *         description: Recordatori esborrat
 *       400:
 *         description: Error
 */
router.delete('/:id', RecordatorisController.delete);

export default router;
