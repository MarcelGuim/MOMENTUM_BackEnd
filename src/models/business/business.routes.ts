import { Router } from 'express';
import {
    createBusiness,
    getAllBusiness,
    getLocationsFromBusinessbyId,
    getAllLocationsFromBusinessbyServiceType,
    getAllBusinessWithLocationOfferingServiceType,
    createLocationForBusiness,
    deleteLocationForBusiness,
    softDeleteBusiness,
    hardDeleteBusiness,

} from './business.controller';

const router = Router();
/**
 * @swagger
 * /business:
 *   post:
 *     summary: Crear un nou negoci
 *     tags: [business]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Perruqueria Alba"
 *               location:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 example: ["661f5c0f7d4f1e3f8e8b4567", "661f5c0f7d4f1e3f8e8b4568"]
 *     responses:
 *       201:
 *         description: Negoci creat correctament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Business created
 *                 business:
 *                   $ref: '#/components/schemas/Business'
 *       400:
 *         description: Error de validació o paràmetres incorrectes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: The IDs format of locations is not valid
 *       409:
 *         description: El negoci ja existeix
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: The business already exists
 *       500:
 *         description: Error intern del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server Error
 */
router.post('/', createBusiness);

/**
 * @swagger
 * /business:
 *   get:
 *     summary: Obtenir tots els negocis disponibles
 *     tags: [business]
 *     responses:
 *       200:
 *         description: Negocis trobats correctament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Businesses found
 *                 businesses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Business'
 *       500:
 *         description: Error del servidor en obtenir els negocis
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error when getting all business
 */
router.get('/', getAllBusiness);

/**
 * @swagger
 * /business/{id}/locations:
 *   get:
 *     summary: Obtenir les ubicacions associades a un negoci pel seu ID
 *     tags: [business]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del negoci
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ubicacions trobades correctament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Locations from business found
 *                 locations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Location'
 *       400:
 *         description: L’ID no és vàlid o no existeix el negoci
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: The ID format of the business is not valid
 *       500:
 *         description: Error del servidor en obtenir les ubicacions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error when getting locations from business
 */
router.get('/:id/locations', getLocationsFromBusinessbyId);

/**
 * @swagger
 * /business/{businessId}/locations/by-serviceType:
 *   get:
 *     summary: Obtenir les ubicacions d’un negoci filtrades per tipus de servei
 *     tags: [business]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         description: ID del negoci
 *         schema:
 *           type: string
 *       - in: query
 *         name: serviceType
 *         required: true
 *         description: Tipus de servei per filtrar les ubicacions
 *         schema:
 *           type: string
 *           enum:
 *             - Haircut
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
 *           example: "yoga class"
 *     responses:
 *       200:
 *         description: Ubicacions trobades amb el tipus de servei especificat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Locations with the specified serviceType found
 *                 locations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Location'
 *       400:
 *         description: Error de validació dels paràmetres (ID o tipus de servei)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   oneOf:
 *                     - example: Invalid or missing serviceType
 *                     - example: Invalid business ID format
 *                     - example: Invalid serviceType
 *       404:
 *         description: El negoci no existeix o no s’ha trobat cap ubicació amb aquest tipus de servei
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   oneOf:
 *                     - example: Business not found
 *                     - example: No location found with this serviceType
 *       500:
 *         description: Error intern del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error when getting locations by service type
 */
router.get('/:businessId/locations/by-serviceType', getAllLocationsFromBusinessbyServiceType);

/**
 * @swagger
 * /business/serviceType/{serviceType}:
 *   get:
 *     summary: Obtenir tots els negocis amb ubicacions que ofereixen un tipus de servei especificat
 *     tags: [business]
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
 *           example: "relaxing massage"
 *         description: Tipus de servei ofert per les ubicacions
 *     responses:
 *       200:
 *         description: Llista de negocis amb ubicacions que ofereixen el servei especificat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Businesses retrieved successfully
 *                 businesses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Business'
 *       400:
 *         description: Tipus de servei invàlid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid serviceType
 *       404:
 *         description: No s'han trobat negocis amb ubicacions que ofereixin aquest servei
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No businesses found with locations offering the specified serviceType
 *       500:
 *         description: Error intern del servidor en recuperar negocis
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to retrieve businesses
 */
router.get('/serviceType/:serviceType', getAllBusinessWithLocationOfferingServiceType);


/**
 * @swagger
 * /business/{businessId}/locations:
 *   post:
 *     summary: Crear una nova ubicació i afegir-la a un negoci existent
 *     tags: [business]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del negoci al qual s'afegirà la nova ubicació
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
 *         description: Ubicació creada i afegida correctament al negoci
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Location created and added to business
 *                 business:
 *                   $ref: '#/components/schemas/Business'
 *       400:
 *         description: ID de negoci invàlid, horari invàlid o tipus de servei invàlid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   oneOf:
 *                     - example: Invalid business ID format
 *                     - example: Invalid schedule format
 *                     - example: ServiceTypes of location are not valid
 *       404:
 *         description: No s'ha trobat el negoci
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Business not found
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
 *                   example: Failed to create location for business
 */
router.post('/:businessId/locations', createLocationForBusiness);

/**
 * @swagger
 * /business/{businessId}/locations/{locationId}:
 *   delete:
 *     summary: Eliminar una ubicació d'un negoci
 *     tags: [business]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del negoci
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la ubicació que es vol eliminar
 *     responses:
 *       200:
 *         description: Ubicació eliminada correctament del negoci
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Location deleted successfully from business
 *                 business:
 *                   $ref: '#/components/schemas/Business'
 *       400:
 *         description: Format d'ID de business o location invàlid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum:
 *                     - Invalid business ID format
 *                     - Invalid location ID format
 *       404:
 *         description: No s'ha trobat la ubicació o el negoci
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum:
 *                     - Location not found in business
 *                     - Location not found in database
 *                     - Business not found
 *       500:
 *         description: Error intern del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to delete location for business
 */
router.delete('/:businessId/locations/:locationId', deleteLocationForBusiness);

/**
 * @swagger
 * /business/{businessId}/softdelete:
 *   patch:
 *     summary: Marcar un negoci i totes les seves ubicacions com a eliminades (soft delete)
 *     tags: [business]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del negoci que es vol eliminar lògicament
 *     responses:
 *       200:
 *         description: Negoci i ubicacions associades eliminades lògicament correctament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Business and its locations were soft deleted successfully
 *                 business:
 *                   $ref: '#/components/schemas/Business'
 *       400:
 *         description: Format d’ID de negoci invàlid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid business ID format
 *       404:
 *         description: No s’ha trobat el negoci
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Business not found
 *       500:
 *         description: Error en eliminar lògicament el negoci o les seves ubicacions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum:
 *                     - Failed to softdelete all associated locations
 *                     - Failed to softdelete business, all associated locations have been softdeleted
 *                     - Failed to perform soft delete for business
 */
router.patch('/:businessId/softdelete', softDeleteBusiness);

/**
 * @swagger
 * /business/{businessId}/harddelete:
 *   delete:
 *     summary: Eliminar definitivament un negoci i les seves ubicacions associades (hard delete)
 *     tags: [business]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del negoci que es vol eliminar permanentment
 *     responses:
 *       200:
 *         description: Negoci i ubicacions eliminades permanentment amb èxit
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Business and its locations were deleted successfully
 *                 business:
 *                   $ref: '#/components/schemas/Business'
 *       400:
 *         description: ID de negoci amb format invàlid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid business ID format
 *       404:
 *         description: El negoci no s'ha trobat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Business not found
 *       500:
 *         description: Error intern en intentar eliminar definitivament el negoci
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to perform hard delete for business
 */
router.delete('/:businessId/harddelete', hardDeleteBusiness);

export default router;