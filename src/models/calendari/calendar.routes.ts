import { Router } from 'express';
import {
    createCalendar,
    getAppointmentsForADay,
    getCalendarOfUser,
    addAppointmentToCalendar,
    hardDeleteCalendarUser,
    softDeleteCalendarUser,
    restoreCalendarUser
} from './calendar.controller';

const router = Router();

/**
 * @swagger
 * /calendars:
 *   post:
 *     summary: Crea un nuevo calendario para un usuario
 *     tags: [Calendars]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 description: ID del usuario
 *               appointments:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs de las citas
 *     responses:
 *       201:
 *         description: Calendario creado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       405:
 *         description: El usuario ya tiene un calendario
 *       500:
 *         description: Error del servidor
 */
router.post('/', createCalendar);

/**
 * @swagger
 * /calendars/appointments/{name}/{date1}:
 *   get:
 *     summary: Obtiene las citas de un usuario para un día específico
 *     tags: [Calendars]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del usuario
 *       - in: path
 *         name: date1
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha en formato YYYY-MM-DD
 *     responses:
 *       201:
 *         description: Citas obtenidas exitosamente
 *       404:
 *         description: El usuario no tiene un calendario
 *       405:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/appointments/:name/:date1', getAppointmentsForADay);

/**
 * @swagger
 * /calendars/user/{name}:
 *   get:
 *     summary: Obtiene el calendario de un usuario por su nombre
 *     tags: [Calendars]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del usuario
 *     responses:
 *       201:
 *         description: Calendario obtenido exitosamente
 *       404:
 *         description: El usuario no tiene un calendario
 *       500:
 *         description: Error del servidor
 */
router.get('/user/:name', getCalendarOfUser);

/**
 * @swagger
 * /calendars/add-appointment/{name}:
 *   post:
 *     summary: Añade una cita al calendario de un usuario
 *     tags: [Calendars]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       201:
 *         description: Cita añadida exitosamente
 *       404:
 *         description: El usuario no tiene un calendario
 *       405:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.post('/add-appointment/:name', addAppointmentToCalendar);

/**
 * @swagger
 * /calendars/hard/{userName}:
 *   delete:
 *     summary: Elimina permanentemente el calendario de un usuario por su nombre
 *     tags: [Calendars]
 *     parameters:
 *       - in: path
 *         name: userName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del usuario
 *     responses:
 *       200:
 *         description: Calendario eliminado permanentemente
 *       404:
 *         description: Calendario o usuario no encontrado
 *       500:
 *         description: Error al eliminar el calendario
 */
router.delete('/hard/:userName', hardDeleteCalendarUser);

/**
 * @swagger
 * /calendars/soft/{userName}:
 *   patch:
 *     summary: Marca como eliminado (soft delete) el calendario de un usuario por su nombre
 *     tags: [Calendars]
 *     parameters:
 *       - in: path
 *         name: userName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del usuario
 *     responses:
 *       200:
 *         description: Calendario marcado como eliminado
 *       404:
 *         description: Calendario o usuario no encontrado
 *       500:
 *         description: Error al marcar el calendario como eliminado
 */
router.patch('/soft/:userName', softDeleteCalendarUser);

/**
 * @swagger
 * /calendars/restore/{userName}:
 *   patch:
 *     summary: Restaura el calendario de un usuario por su nombre (soft undelete)
 *     tags: [Calendars]
 *     parameters:
 *       - in: path
 *         name: userName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del usuario
 *     responses:
 *       200:
 *         description: Calendario restaurado
 *       404:
 *         description: Calendario o usuario no encontrado
 *       500:
 *         description: Error al restaurar el calendario
 */
router.patch('/restore/:userName', restoreCalendarUser);

export default router;