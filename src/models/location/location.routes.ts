import { Router } from "express";
import { getPlacesHandler, getRouteHandler } from "./location.controller";

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


/**
 * @swagger
 * /location/route:
 *   post:
 *     summary: Calcula una ruta entre dos punts
 *     tags: [location]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lon1:
 *                 type: number
 *               lat1:
 *                 type: number
 *               lon2:
 *                 type: number
 *               lat2:
 *                 type: number
 *               mode:
 *                 type: string
 *                 enum: [DRIVE, BICYCLE, WALK, TRANSIT]
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
router.post('/route', getRouteHandler);

export default router;