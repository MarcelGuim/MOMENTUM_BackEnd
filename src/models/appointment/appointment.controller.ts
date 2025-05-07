import { Request, Response } from 'express';
import { AppointmentService } from './appointment.services';
import { IAppointment } from './appointment.model';

const appointmentService = new AppointmentService();

// Crear una nueva cita
export async function createAppointment(req: Request, res: Response): Promise<Response> {
  try {
      console.log("Creating appointment with data:", req.body);
      const appointment: Partial<IAppointment> = req.body;
      const answer = await appointmentService.createAppointment(appointment);
      
      console.log("Appointment successfully created:", answer);
      return res.status(200).json({
        message: "Appointment created",
        appointment: answer
      });
  } catch (error) {
      console.error("Error creating appointment:", error);
      return res.status(500).json({
          message: "Failed to create appointment",
          error: error instanceof Error ? error.message : "Unknown error"
      });
  }
}

// Obtener cita por ID
export async function getAppointmentById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const appointment = await appointmentService.getAppointmentById(id);
    if (appointment != null) {
      return res.status(200).json({
        message: "Appointment found",
        appointment: appointment
      });
    } else {
      console.log("Appointment not found");
      return res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error) {
    console.log("Server ERROR: ", error);
    return res.status(500).json({
        message: "Server ERROR, failed to get appointment"
    });
  }
}



// Actualizar cita por ID
export async function updateAppointmentById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const appointment: IAppointment = req.body;
    const updatedAppointment = await appointmentService.updateAppointmentById(id,appointment);
    if (updatedAppointment != null) {
      return res.status(200).json({
        message: "Appointment updated successfully",
        appointment: updatedAppointment
      });
    } else {
      console.log('Appointment not found');
      return res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error) {
    console.log("Server ERROR: ", error);
    return res.status(500).json({ message: 'Failed to update appointment' });
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
        appointment: appointment
      });
    } else {
      console.log('Appointment not found');
      return res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error) {
    console.log("Server ERROR: ", error);
    return res.status(500).json({ message: 'Failed to delete appointment' });
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
        appointment: appointment
      });
    } else {
      console.log('Appointment not found');
      return res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error) {
    console.log("Server ERROR: ", error);
    return res.status(500).json({ message: 'Failed to soft delete appointment' });
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
        appointment: appointment
      });
    } else {
      console.log('Appointment not found');
      return res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error) {
    console.log("Server ERROR: ", error);
    return res.status(500).json({ message: 'Failed to restore appointment' });
  }
}
