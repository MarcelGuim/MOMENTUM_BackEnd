import { IAppointment } from './appointment.model';
import Appointment from './appointment.model';

export class AppointmentService {
  async createAppointment(data: Partial<IAppointment>): Promise<IAppointment> {
    const appointment = new Appointment(data);
    return await appointment.save();
  }

  async getAppointmentById(id: string): Promise<IAppointment | null> {
    return await Appointment.findById(id);
  }

  // Actualizar cita por ID
  async updateAppointmentById(
    id: string,
    data: Partial<IAppointment>
  ): Promise<IAppointment | null> {
    return await Appointment.findByIdAndUpdate(id, data, { new: true });
  }

  // Hard delete
  async hardDeleteAppointmentById(id: string): Promise<IAppointment | null> {
    return await Appointment.findByIdAndDelete(id);
  }

  // Soft delete
  async softDeleteAppointmentById(id: string): Promise<IAppointment | null> {
    return await Appointment.findByIdAndUpdate(
      id,
      { isDeleted: true }, // Marcamos como eliminada
      { new: true }
    );
  }

  // Soft undelete
  async restoreAppointmentById(id: string): Promise<IAppointment | null> {
    return await Appointment.findByIdAndUpdate(
      id,
      { isDeleted: false },
      { new: true }
    );
  }
}
