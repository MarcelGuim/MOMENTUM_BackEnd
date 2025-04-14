import { Router } from "express";
import { createLocationHandler, getLocationByIdHandler, getAllLocationsHandler, updateLocationByIdHandler, deleteLocationByIdHandler, getPlacesHandler, getRouteHandler } from "./location.controller";

const router = Router();

/**
 * @swagger
 * /location:
 *   post:
 *     summary: Crea una nueva ubicación
 *     tags: [location]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - address
 *               - rating
 *               - ubicacion
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Parque del Retiro"
 *               address:
 *                 type: string
 *                 example: "Calle de Alfonso XII, Madrid"
 *               rating:
 *                 type: number
 *                 format: float
 *                 example: 4.5
 *               ubicacion:
 *                 type: object
 *                 required:
 *                   - type
 *                   - coordinates
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [Point]
 *                     example: "Point"
 *                   coordinates:
 *                     type: array
 *                     minItems: 2
 *                     maxItems: 2
 *                     items:
 *                       type: number
 *                     example: [-3.70379, 40.41678]  # [longitude, latitude]
 *     responses:
 *       200:
 *         description: Location created successfully
 *       409:
 *         description: Location already exists
 *       404:
 *         description: Location not created, there has been an error
 *       500:
 *         description: Failed to create location
 */
router.post('/', createLocationHandler);

/**
 * @swagger
 * /location/{id}:
 *   get:
 *     summary: Obté una ubicació per ID
 *     tags: [location]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ok
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.get('/:id', getLocationByIdHandler);

/**
 * @swagger
 * /location:
 *   get:
 *     summary: Llista totes les ubicacions
 *     tags: [location]
 *     responses:
 *       200:
 *         description: Ok
 *       500:
 *         description: Internal Server Error
 */
router.get('/', getAllLocationsHandler);

/**
 * @swagger
 * /location/{id}:
 *   put:
 *     summary: Actualiza una ubicación existente
 *     tags: [location]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la ubicación a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               address:
 *                 type: string
 *               rating:
 *                 type: number
 *                 format: float
 *               ubicacion:
 *                 type: object
 *                 required:
 *                   - type
 *                   - coordinates
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [Point]
 *                   coordinates:
 *                     type: array
 *                     minItems: 2
 *                     maxItems: 2
 *                     items:
 *                       type: number
 *     responses:
 *       200:
 *         description: Ubicación actualizada con éxito
 *       400:
 *         description: Solicitud incorrecta
 *       404:
 *         description: Ubicación no encontrada
 *       500:
 *         description: Error del servidor
 */

router.put('/:id', updateLocationByIdHandler);

/**
 * @swagger
 * /location/{id}:
 *   delete:
 *     summary: Elimina una ubicació
 *     tags: [location]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:id', deleteLocationByIdHandler);

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