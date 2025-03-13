import { Router } from 'express';
import {
    createCalendar,
    getAppointmentsForADay,
    getCalendarsOfUser,
    addAppointmentToCalendar,
    hardDeleteCalendarsUser,
    softDeleteCalendarsUser,
    restoreCalendarsUser,
    getAllAppointments,
    getAppointmentsBetweenDates
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
 *               owner:
 *                 type: string
 *                 description: ID del usuario
 *               calendarName:
 *                 type: string
 *                 description: Nombre del calendario
 *               appointments:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs de las citas
 *               invitees:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs de los usuarios con acceso al calendario
 *     responses:
 *       201:
 *         description: Calendario creado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.post('/', createCalendar);

/**
 * @swagger
 * /calendars/appointments/{userId}:
 *   get:
 *     summary: Obtiene todas las citas de un usuario
 *     tags: [Calendars]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Citas obtenidas exitosamente
 *       500:
 *         description: Error del servidor
 */
router.get('/appointments/:userId', getAllAppointments);

/**
 * @swagger
 * /calendars/appointments/{userId}/{d1}/{d2}:
 *   get:
 *     summary: Obtiene las citas de un usuario entre dos fechas
 *     tags: [Calendars]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *       - in: path
 *         name: d1
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha y hora inicial
 *       - in: path
 *         name: d2
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha y hora final
 *     responses:
 *       200:
 *         description: Citas obtenidas exitosamente
 *       500:
 *         description: Error del servidor
 */
router.get('/appointments/:userId/:d1/:d2', getAppointmentsBetweenDates);

/**
 * @swagger
 * /calendars/appointments/{userId}/{date}:
 *   get:
 *     summary: Obtiene las citas de un usuario para un día específico
 *     tags: [Calendars]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha en formato YYYY-MM-DD
 *     responses:
 *       200:
 *         description: Citas obtenidas exitosamente
 *       500:
 *         description: Error del servidor
 */
router.get('/appointments/:userId/:date', getAppointmentsForADay);

/**
 * @swagger
 * /calendars/user/{userId}:
 *   get:
 *     summary: Obtiene los calendarios de un usuario por su ID
 *     tags: [Calendars]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Calendario obtenido exitosamente
 *       500:
 *         description: Error del servidor
 */
router.get('/user/:userId', getCalendarsOfUser);

/**
 * @swagger
 * /calendars/add-appointment/{calendarId}:
 *   post:
 *     summary: Añade una cita al calendario de un usuario
 *     tags: [Calendars]
 *     parameters:
 *       - in: path
 *         name: calendarId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del calendario
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
 *         description: Calendario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.post('/add-appointment/:calendarId', addAppointmentToCalendar);

/**
 * @swagger
 * /calendars/hard/{userId}:
 *   delete:
 *     summary: Elimina permanentemente los calendarios de un usuario
 *     tags: [Calendars]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Calendarios eliminados permanentemente
 *       404:
 *         description: Calendarios o usuario no encontrado
 *       500:
 *         description: Error al eliminar los calendarios
 */
router.delete('/hard/:userId', hardDeleteCalendarsUser);

/**
 * @swagger
 * /calendars/soft/{userId}:
 *   patch:
 *     summary: Marca como eliminado (soft delete) los calendarios de un usuario
 *     tags: [Calendars]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Calendarios marcados como eliminados
 *       404:
 *         description: Calendarios o usuario no encontrado
 *       500:
 *         description: Error al marcar los calendarios como eliminados
 */
router.patch('/soft/:userId', softDeleteCalendarsUser);

/**
 * @swagger
 * /calendars/restore/{userId}:
 *   patch:
 *     summary: Restaura los calendario de un usuario (soft undelete)
 *     tags: [Calendars]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Calendarios restaurados
 *       404:
 *         description: Calendarios o usuario no encontrado
 *       500:
 *         description: Error al restaurar los calendarios
 */
router.patch('/restore/:userId', restoreCalendarsUser);

export default router;