import { Router } from 'express';

import {
  sendMessage,
  getPeopleWithWhomUserChatted,
  getPeopleWithWhomWorkerChatted,
  getChat,
  createChat,
  getLast20Messages,
  getChatId,
  editChat,
  deleteChat,
} from './chat.controller';
import { requireOwnership, verifyToken } from '../../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: API per gestionar xats
 */

/**
 * @swagger
 * /chat/send:
 *   post:
 *     summary: Envia un missatge a un xat existent
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatId
 *               - userFrom
 *               - message
 *             properties:
 *               chatId:
 *                 type: string
 *               userFrom:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Missatge enviat correctament
 *       403:
 *         description: Usuari no pertany al xat
 *       404:
 *         description: Chat o usuaris no trobats
 *       505:
 *         description: Missatge no enviat per error lògic
 *       500:
 *         description: Error inesperat
 */
router.post("/send", sendMessage);

/**
 * @swagger
 * /chat/people/user/{userId}:
 *   get:
 *     summary: Obté usuaris amb qui un usuari ha xatejat
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Llista d'usuaris trobada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 people:
 *                   type: array
 *                   items:
 *                     type: array
 *                     items:
 *                       type: string
 *       404:
 *         description: Usuari no trobat o cap persona amb qui ha xatejat
 *       500:
 *         description: Error inesperat
 */
router.get("/people/user/:userId",  verifyToken, requireOwnership('userId'), getPeopleWithWhomUserChatted);

/**
 * @swagger
 * /chat/people/worker/{workerId}:
 *   get:
 *     summary: Obté usuaris amb qui un worker ha xatejat
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: workerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Llista d'usuaris trobada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 people:
 *                   type: array
 *                   items:
 *                     type: array
 *                     items:
 *                       type: string
 *       404:
 *         description: Worker no trobat o cap persona amb qui ha xatejat
 *       500:
 *         description: Error inesperat
 */
router.get("/people/worker/:workerId",  verifyToken, requireOwnership('workerId'), getPeopleWithWhomWorkerChatted);

/**
 * @swagger
 * /chat/messages/{chatId}:
 *   get:
 *     summary: Obté els últims 20 missatges d’un xat
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Missatges obtinguts correctament
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       404:
 *         description: Xat no trobat
 *       500:
 *         description: Error inesperat
 */
router.get("/messages/:chatId", getLast20Messages);

/**
 * @swagger
 * /chat/{user1ID}/{user2ID}:
 *   get:
 *     summary: Obté el xat entre dos usuaris
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: user1ID
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: user2ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xat trobat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       404:
 *         description: Xat o usuaris no trobats
 *       500:
 *         description: Error inesperat
 */
router.get("/:user1ID/:user2ID", getChat);

/**
 * @swagger
 * /chat/id/{user1ID}/{user2ID}:
 *   get:
 *     summary: Obté el ID del xat entre dos usuaris
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: user1ID
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: user2ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ID del xat trobat
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *       404:
 *         description: Xat o usuaris no trobats
 *       500:
 *         description: Error inesperat
 */
router.get("/id/:user1ID/:user2ID", getChatId);

/**
 * @swagger
 * /chat/create:
 *   post:
 *     summary: Crea un nou xat entre dos usuaris
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user1ID
 *               - user2ID
 *               - typeOfUser1
 *               - typeOfUser2
 *             properties:
 *               user1ID:
 *                 type: string
 *               user2ID:
 *                 type: string
 *               typeOfUser1:
 *                 type: string
 *               typeOfUser2:
 *                 type: string
 *     responses:
 *       201:
 *         description: Xat creat correctament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 chat:
 *                   $ref: '#/components/schemas/Chat'
 *       409:
 *         description: El xat ja existeix
 *       500:
 *         description: Error inesperat
 */
router.post("/create", createChat);

/**
 * @swagger
 * /chat/{chatId}:
 *   patch:
 *     summary: Edita un chat existent
 *     tags:
 *       - Chat
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         description: ID del xat
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user1:
 *                 type: string
 *                 description: ID de l'usuari 1
 *               typeOfUser1:
 *                 type: string
 *                 enum: [worker, user, location, business]
 *               user2:
 *                 type: string
 *                 description: ID de l'usuari 2
 *               typeOfUser2:
 *                 type: string
 *                 enum: [worker, user, location, business]
 *     responses:
 *       200:
 *         description: Xat editat. Retorna el nou xat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       404:
 *         description: Xat no trobat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Chat not found
 *       500:
 *         description: Error intern
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 */
router.patch("/:chatId", editChat);

/**
 * @swagger
 * /chat/{chatId}:
 *   delete:
 *     summary: Elimina un xat
 *     tags:
 *       - Chat
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         description: ID del xat
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xat eliminat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       404:
 *         description: Xat no trobat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Chat not found
 *       500:
 *         description: Error intern
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 */
router.delete("/:chatId", deleteChat);

export default router;