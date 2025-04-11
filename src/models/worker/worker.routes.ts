import { Request, Response, Router } from 'express';
import { workerValidationRules, workerValidator } from './worker.validation';
import { verifyRefresh, authenticate } from '../../middleware/auth.middleware';
import {
  diguesHola,
  createWorker,
  activateWorker,
  getWorkerById,
  updateWorkerById,
  hardDeleteWorkerById,
  softDeleteWorkerById,
  softDeleteWorkersByIds,
  restoreWorkerById,
  getWorkersPaginated,
  getWorkersPaginatedByCompany,
  loginWorker,
  refresh,
  logout
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
 *               empresa:
 *                 type: string
 *                 description: ID de la empresa asociada
 *     responses:
 *       201:
 *         description: Trabajador creado
 *       500:
 *         description: Error al crear trabajador
 */
router.post("", workerValidationRules(), workerValidator, createWorker);

/**
 * @swagger
 * /workers/activate/{name}/{id}:
 *   get:
 *     summary: Activar cuenta de trabajador
 *     tags: [workers]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cuenta activada
 *       404:
 *         description: Trabajador no encontrado
 */
router.get("/activate/:name/:id", activateWorker);

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
router.put("/:workerId", workerValidationRules(), workerValidator, updateWorkerById);

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
 * /workers/login:
 *   post:
 *     summary: Log in a worker
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name_or_mail, password]
 *             properties:
 *               name_or_mail:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Worker logged in
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", loginWorker);

/**
 * @swagger
 * /workers/refresh:
 *   post:
 *     summary: Refresh worker access token
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Token refreshed
 *       401:
 *         description: Invalid refresh token
 */
router.post("/refresh", verifyRefresh, refresh);

/**
 * @swagger
 * /workers/logout:
 *   post:
 *     summary: Log out worker
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Worker logged out
 */
router.post("/logout", authenticate, logout);

export default router;