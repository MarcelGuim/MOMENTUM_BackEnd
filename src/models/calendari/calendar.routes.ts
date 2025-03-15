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
 * /calendars/{userId}/appointments:
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
router.get('/:userId/appointments', getAllAppointments);

/**
 * @swagger
 * /calendars/{userId}/appointments:
 *   get:
 *     summary: Obtiene las citas de un usuario entre dos fechas
 *     tags: [Calendars]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha y hora inicial
 *       - in: query
 *         name: endDate
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
router.get('/:userId/appointments', getAppointmentsBetweenDates);

/**
 * @swagger
 * /calendars/{userId}/appointments/{date}:
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
router.get('/:userId/appointments/:date', getAppointmentsForADay);

/**
 * @swagger
 * /calendars/{userId}:
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
router.get('/:userId', getCalendarsOfUser);

/**
 * @swagger
 * /calendars/{calendarId}/appointments:
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
router.post('/:calendarId/appointments', addAppointmentToCalendar);

/**
 * @swagger
 * /calendars/{userId}/delete:
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
router.delete('/:userId', hardDeleteCalendarsUser);

/**
 * @swagger
 * /calendars/{userId}/soft-delete:
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
router.patch('/:userId/soft-delete', softDeleteCalendarsUser);

/**
 * @swagger
 * /calendars/{userId}/restore:
 *   patch:
 *     summary: Restaura los calendarios de un usuario (soft undelete)
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
router.patch('/:userId/restore', restoreCalendarsUser);

export default router;
