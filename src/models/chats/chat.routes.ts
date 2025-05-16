import { Router } from 'express';

import {
  sendMessage,
  getPeopleWithWhomUserChatted,
  getChat,
  createChat,
  getLast20Messages,
  getChatId,
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
 *       500:
 *         description: Error inesperat
 */
router.post("/send", sendMessage);

/**
 * @swagger
 * /chat/people/{userId}:
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
 *               type: array
 *               items:
 *                 type: string
 *       404:
 *         description: Usuari no trobat o cap persona amb qui ha xatejat
 *       500:
 *         description: Error inesperat
 */
router.get("/people/:userId",  verifyToken, requireOwnership('userId'), getPeopleWithWhomUserChatted);

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
 *                 type: array
 *                 items:
 *                   oneOf:
 *                     - type: string
 *                     - type: boolean
 *                     - type: string  # ISO Date string
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
 *       404:
 *         description: Xat o usuaris no trobats
 *       500:
 *         description: Error inesperat
 */
router.get("/:user1ID/:user2ID", getChat);

/**
 * @swagger
 * /chat/{user1ID}/{user2ID}:
 *   get:
 *     summary: Obté el id del xat entre dos usuaris
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
 *             properties:
 *               user1ID:
 *                 type: string
 *               user2ID:
 *                 type: string
 *     responses:
 *       201:
 *         description: Xat creat correctament
 *       409:
 *         description: El xat ja existeix
 *       500:
 *         description: Error inesperat
 */
router.post("/create", createChat);


export default router;
