import { Request, Response, Router } from 'express';
import { workerValidationRules, workerValidator } from './worker.validation';
import {  verifyToken, requireAdmin } from '../../middleware/auth.middleware';

import {
  diguesHola,
  createWorker,
  getWorkerById,
  updateWorkerById,
  hardDeleteWorkerById,
  softDeleteWorkerById,
  softDeleteWorkersByIds,
  restoreWorkerById,
  getWorkersPaginated,
  getWorkersPaginatedByCompany,
  createWorkerWithMultipleLocations,
  getWorkersByBusinessId
} from './worker.controller';


const router = Router();
/**
 * @swagger
 * tags:
 *   - name: workers
 *     description: Operaciones relacionadas con trabajadores
 *   - name: Authentication
 *     description: Autenticación de trabajadores
 */

/**
 * @swagger
 * /workers/Hola:
 *   get:
 *     summary: Obtener un saludo
 *     tags: [workers]
 *     responses:
 *       200:
 *         description: Saludo obtenido
 */
router.get("/Hola", diguesHola);

/**
 * @swagger
 * /workers:
 *   post:
 *     summary: Registrar nuevo trabajador
 *     tags: [workers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, age, mail, password, empresa]
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               mail:
 *                 type: string
 *               password:
 *                 type: string
 *               location:
 *                 type: string
 *                 description: ID de la location asociada
 *     responses:
 *       201:
 *         description: Trabajador creado
 *       500:
 *         description: Error al crear trabajador
 */
router.post("", workerValidationRules(), workerValidator, verifyToken, requireAdmin, createWorker);

/**
 * @swagger
 * /workers/multiple-locations:
 *   post:
 *     summary: Create a worker with multiple locations
 *     tags: [workers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, mail, password, location]
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the worker
 *                 example: John Doe
 *               mail:
 *                 type: string
 *                 description: Email of the worker
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 description: Password for the worker
 *                 example: strongpassword123
 *               location:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of location IDs
 *                 example: ["60f7f9f5b5d6c81234567890", "60f7f9f5b5d6c81234567891"]
 *     responses:
 *       201:
 *         description: Worker created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Worker created successfully with multiple locations
 *                 worker:
 *                   $ref: '#/components/schemas/Worker'
 *       400:
 *         description: Invalid input or locations
 *       409:
 *         description: Worker already exists
 *       500:
 *         description: Server error
 */
router.post("/multiple-locations", workerValidator, verifyToken, requireAdmin, createWorkerWithMultipleLocations);

/**
 * @swagger
 * /workers/{userId}:
 *   get:
 *     summary: Obtener trabajador por ID
 *     tags: [workers]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trabajador encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Worker'
 *       404:
 *         description: Trabajador no encontrado
 */
router.get("/:workerId", getWorkerById);

/**
 * @swagger
 * /workers/{userId}:
 *   put:
 *     summary: Actualizar trabajador
 *     tags: [workers]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
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
 *               empresa:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trabajador actualizado
 *       404:
 *         description: Trabajador no encontrado
 */
router.put("/:workerId", workerValidationRules(), workerValidator,  updateWorkerById);

/**
 * @swagger
 * /workers/company/{companyId}/paginated:
 *   get:
 *     summary: Obtener trabajadores paginados por empresa
 *     tags: [workers]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: getDeleted
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lista paginada de trabajadores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 workers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Worker'
 *                 totalPages:
 *                   type: integer
 *                 totalWorkers:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 */
router.get("/company/:companyId/paginated", getWorkersPaginatedByCompany);

/**
 * @swagger
 * /workers/{userId}:
 *   delete:
 *     summary: Hard delete a worker by ID
 *     tags: [workers]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Worker deleted
 *       404:
 *         description: Worker not found
 */
router.delete("/:workerId", hardDeleteWorkerById);

/**
 * @swagger
 * /workers/{userId}/soft:
 *   patch:
 *     summary: Soft delete worker by ID
 *     tags: [workers]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Worker soft deleted
 */
router.patch("/:workerId/soft", softDeleteWorkerById);

/**
 * @swagger
 * /workers/soft:
 *   patch:
 *     summary: Soft delete multiple workers by IDs
 *     tags: [workers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [workersIds]
 *             properties:
 *               workersIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Workers soft deleted
 */
router.patch("/soft", softDeleteWorkersByIds);

/**
 * @swagger
 * /workers/{userId}/restore:
 *   patch:
 *     summary: Restore a soft-deleted worker
 *     tags: [workers]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Worker restored
 */
router.patch("/:workerId/restore", restoreWorkerById);

/**
 */
router.patch("/soft", softDeleteWorkersByIds);

/**
 * @swagger
 * /workers/{userId}/restore:
 *   patch:
 *     summary: Restore a soft-deleted worker
 *     tags: [workers]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Worker restored
 */
router.patch("/:userId/restore", restoreWorkerById);

/**
 * @swagger
 * /workers:
 *   get:
 *     summary: Get paginated workers
 *     tags: [workers]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated list of workers
 */
router.get("", getWorkersPaginated);


/**
 * @swagger
 * /workers/business/{businessId}:
 *   get:
 *     summary: Get all workers of a business
 *     tags: [workers]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the business
 *     responses:
 *       200:
 *         description: List of workers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Worker'
 *       400:
 *         description: Invalid business ID
 *       404:
 *         description: Business not found
 *       500:
 *         description: Server error
 */
router.get('/business/:businessId', getWorkersByBusinessId);

export default router;