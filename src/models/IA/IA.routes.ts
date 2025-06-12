import { Router } from 'express';
import { TestConnection, optimizeAppointments } from './IA.controller';
const router = Router();
/**
 * @swagger
 * /ia/test:
 *   post:
 *     summary: Test de connexió amb el servei d'intel·ligència artificial
 *     tags: [IA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - textToOptimize
 *             properties:
 *               textToOptimize:
 *                 type: string
 *                 example: "Aquest és un text de prova"
 *     responses:
 *       200:
 *         description: Connexió realitzada i resposta obtinguda
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 textOptimized:
 *                   type: string
 *       500:
 *         description: Error inesperat
 */
router.post('/test', TestConnection);

/**
 * @swagger
 * /ia/optimizeAppointments:
 *   post:
 *     summary: Retorna totes les cites de l'usuari basant-se en les dades interpretades per IA
 *     tags: [IA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - requests
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "665098d35b2f64e9e0c290ab"
 *               requests:
 *                 type: array
 *                 description: Llista de tuples amb data i serveis
 *                 items:
 *                   type: array
 *                   items:
 *                     oneOf:
 *                       - type: string
 *                         format: date
 *                         example: "2025-06-01"
 *                       - type: array
 *                         items:
 *                           type: string
 *                         example: ["haircut", "massage"]
 *     responses:
 *       200:
 *         description: Llista de cites trobades
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       404:
 *         description: No s'han trobat cites
 *       500:
 *         description: Error inesperat
 */
router.post('/optimizeAppointments', optimizeAppointments);

export default router;
