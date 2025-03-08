import { Request, Response } from 'express';
import { AppointmentService } from './appointment.services';
import { IAppointment } from './appointment.model';

const appointmentService = new AppointmentService();

// Crear una nueva cita
export async function createAppointment(req: Request, res: Response): Promise<Response> {
  try {
    const { inTime, outTime, place, title } = req.body;
    const newAppointment: Partial<IAppointment> = { inTime, outTime, place, title };
    const appointment = await appointmentService.createAppointment(newAppointment);
    return res.status(200).json({
      message: "Appointment created",
      appointment
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create appointment' });
  }
}

// Obtener cita por ID
export async function getAppointmentById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const appointment = await appointmentService.getAppointmentById(id);
    if (appointment) {
      return res.status(200).json(appointment);
    } else {
      return res.status(404).json({ error: 'Appointment not found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get appointment' });
  }
}

// Actualizar cita por ID
export async function updateAppointmentById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const { inTime, outTime, place, title } = req.body;
    const updatedAppointment = await appointmentService.updateAppointmentById(id, { inTime, outTime, place, title });
    if (updatedAppointment) {
      return res.status(200).json({
        message: "Appointment updated successfully",
        updatedAppointment
      });
    } else {
      return res.status(404).json({ error: 'Appointment not found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update appointment' });
  }
}

// Hard delete de la cita
export async function hardDeleteAppointmentById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const appointment = await appointmentService.hardDeleteAppointmentById(id);
    if (appointment) {
      return res.status(200).json({
        message: "Appointment deleted",
        appointment
      });
    } else {
      return res.status(404).json({ error: 'Appointment not found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete appointment' });
  }
}

// Soft delete de la cita
export async function softDeleteAppointmentById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const appointment = await appointmentService.softDeleteAppointmentById(id);
    if (appointment) {
      return res.status(200).json({
        message: "Appointment soft deleted (marked as unavailable)",
        appointment
      });
    } else {
      return res.status(404).json({ error: 'Appointment not found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to soft delete appointment' });
  }
}

// Restaurar cita (undelete)
export async function restoreAppointmentById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const appointment = await appointmentService.restoreAppointmentById(id);
    if (appointment) {
      return res.status(200).json({
        message: "Appointment restored (marked as available)",
        appointment
      });
    } else {
      return res.status(404).json({ error: 'Appointment not found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to restore appointment' });
  }
}
