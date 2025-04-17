import { Router } from "express";
import { createLocationHandler, getLocationByIdHandler, getAllLocationsHandler, updateLocationByIdHandler, deleteLocationByIdHandler, getAllLocationsByServiceTypeHandler, getLocationsNearHandler, getPlacesHandler, getRouteHandler } from "./location.controller";

const router = Router();

/**
 * @swagger
 * /location:
 *   post:
 *     summary: Crear una nova ubicació
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
 *               - phone
 *               - rating
 *               - ubicacion
 *               - serviceType
 *               - schedule
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Centre Salut Integral"
 *               address:
 *                 type: string
 *                 example: "Carrer del Nord, 10, Lleida"
 *               phone:
 *                 type: string
 *                 example: "+34 973 123 456"
 *               rating:
 *                 type: number
 *                 example: 4.6
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
 *                     example: [0.6255, 41.6171]
 *               serviceType:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum:
 *                     - haircut
 *                     - hair coloring
 *                     - hair treatment
 *                     - beard trim
 *                     - facial cleansing
 *                     - makeup
 *                     - manicure
 *                     - pedicure
 *                     - eyebrows and lashes
 *                     - waxing
 *                     - relaxing massage
 *                     - medical appointment
 *                     - physiotherapy
 *                     - therapy session
 *                     - dentist appointment
 *                     - nutritionist
 *                     - gym workout
 *                     - yoga class
 *                     - pilates class
 *                     - boxing class
 *                     - swimming session
 *                     - personal training
 *                     - restaurant reservation
 *                     - takeaway order
 *                     - catering service
 *                     - private dinner
 *                     - wine tasting
 *                     - tattoo
 *                     - piercing
 *                     - language class
 *                     - music lesson
 *                     - dance class
 *                     - coaching session
 *                 example: ["gym workout", "relaxing massage", "haircut"]
 *               schedule:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [day, open, close]
 *                   properties:
 *                     day:
 *                       type: string
 *                       enum:
 *                         - monday
 *                         - tuesday
 *                         - wednesday
 *                         - thursday
 *                         - friday
 *                         - saturday
 *                         - sunday
 *                       example: monday
 *                     open:
 *                       type: string
 *                       example: "09:00"
 *                     close:
 *                       type: string
 *                       example: "20:00"
 *     responses:
 *       201:
 *         description: Ubicació creada correctament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Location created successfully
 *                 location:
 *                   $ref: '#/components/schemas/Location'
 *       400:
 *         description: Format de dades incorrecte o tipus de servei invàlid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   oneOf:
 *                     - example: Error with data format in schedule
 *                     - example: ServiceTypes of location are not valid
 *       409:
 *         description: La ubicació ja existeix
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Location already exists
 *       500:
 *         description: Error intern del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to create location
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
 *     summary: Actualitza una ubicació existent
 *     tags: [location]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la ubicació a actualitzar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - address
 *               - phone
 *               - rating
 *               - ubicacion
 *               - serviceType
 *               - schedule
 *               - isDeleted
 *             properties:
 *               nombre:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               rating:
 *                 type: number
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
 *               serviceType:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum:
 *                     - haircut
 *                     - hair coloring
 *                     - hair treatment
 *                     - beard trim
 *                     - facial cleansing
 *                     - makeup
 *                     - manicure
 *                     - pedicure
 *                     - eyebrows and lashes
 *                     - waxing
 *                     - relaxing massage
 *                     - medical appointment
 *                     - physiotherapy
 *                     - therapy session
 *                     - dentist appointment
 *                     - nutritionist
 *                     - gym workout
 *                     - yoga class
 *                     - pilates class
 *                     - boxing class
 *                     - swimming session
 *                     - personal training
 *                     - restaurant reservation
 *                     - takeaway order
 *                     - catering service
 *                     - private dinner
 *                     - wine tasting
 *                     - tattoo
 *                     - piercing
 *                     - language class
 *                     - music lesson
 *                     - dance class
 *                     - coaching session
 *               schedule:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [day, open, close]
 *                   properties:
 *                     day:
 *                       type: string
 *                       enum:
 *                         - monday
 *                         - tuesday
 *                         - wednesday
 *                         - thursday
 *                         - friday
 *                         - saturday
 *                         - sunday
 *                     open:
 *                       type: string
 *                     close:
 *                       type: string
 *               isDeleted:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Ubicació actualitzada correctament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Location updated successfully
 *                 location:
 *                   $ref: '#/components/schemas/Location'
 *       400:
 *         description: Format de dades incorrecte o tipus de servei invàlid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   oneOf:
 *                     - example: Error with data format in schedule
 *                     - example: ServiceTypes of location are not valid
 *       404:
 *         description: La ubicació no existeix
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Location not found
 *       500:
 *         description: Error intern del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to update location
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
 * /location/serviceType/{serviceType}:
 *   get:
 *     summary: Obtener todas las ubicaciones por tipo de servicio
 *     tags: [location]
 *     parameters:
 *       - in: path
 *         name: serviceType
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - haircut
 *             - hair coloring
 *             - hair treatment
 *             - beard trim
 *             - facial cleansing
 *             - makeup
 *             - manicure
 *             - pedicure
 *             - eyebrows and lashes
 *             - waxing
 *             - relaxing massage
 *             - medical appointment
 *             - physiotherapy
 *             - therapy session
 *             - dentist appointment
 *             - nutritionist
 *             - gym workout
 *             - yoga class
 *             - pilates class
 *             - boxing class
 *             - swimming session
 *             - personal training
 *             - restaurant reservation
 *             - takeaway order
 *             - catering service
 *             - private dinner
 *             - wine tasting
 *             - tattoo
 *             - piercing
 *             - language class
 *             - music lesson
 *             - dance class
 *             - coaching session
 *         description: Tipo de servicio por el cual filtrar las ubicaciones
 *     responses:
 *       200:
 *         description: Lista de ubicaciones filtradas por tipo de servicio
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Location'
 *       400:
 *         description: Tipo de servicio inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid service type
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to fetch locations
 */
router.get('/serviceType/:serviceType', getAllLocationsByServiceTypeHandler);



/**
 * @swagger
 * /location/search/nearby:
 *   get:
 *     summary: Buscar ubicaciones por tipo de servicio y distancia cercana
 *     tags: [location]
 *     parameters:
 *       - in: query
 *         name: lon
 *         required: true
 *         schema:
 *           type: number
 *           example: 0.6255
 *         description: Longitud del punto de referencia
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *           example: 41.6171
 *         description: Latitud del punto de referencia
 *       - in: query
 *         name: distance
 *         required: true
 *         schema:
 *           type: number
 *           example: 5000
 *         description: Distancia máxima en metros (por ejemplo, 5000 metros equivale a 5 km)
 *       - in: query
 *         name: serviceType
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - haircut
 *             - hair coloring
 *             - hair treatment
 *             - beard trim
 *             - facial cleansing
 *             - makeup
 *             - manicure
 *             - pedicure
 *             - eyebrows and lashes
 *             - waxing
 *             - relaxing massage
 *             - medical appointment
 *             - physiotherapy
 *             - therapy session
 *             - dentist appointment
 *             - nutritionist
 *             - gym workout
 *             - yoga class
 *             - pilates class
 *             - boxing class
 *             - swimming session
 *             - personal training
 *             - restaurant reservation
 *             - takeaway order
 *             - catering service
 *             - private dinner
 *             - wine tasting
 *             - tattoo
 *             - piercing
 *             - language class
 *             - music lesson
 *             - dance class
 *             - coaching session
 *           example: haircut
 *         description: Tipo de servicio a buscar
 *     responses:
 *       200:
 *         description: Lista de ubicaciones cercanas encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Location'
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error del servidor
 */
router.get('/search/nearby', getLocationsNearHandler);





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