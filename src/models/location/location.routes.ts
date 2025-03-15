import { Router } from "express";
import { getPlacesHandler } from "./location.controller";

const router = Router();


/**
 * @swagger
 * /location/search:
 *   post:
 *     summary: Cerca llocs dins d'una àrea
 *     tags: [location]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lonmin:
 *                 type: number
 *               latmin:
 *                 type: number
 *               lonmax:
 *                 type: number
 *               latmax:
 *                 type: number
 *               query:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
router.post('/search', getPlacesHandler);

export default router;