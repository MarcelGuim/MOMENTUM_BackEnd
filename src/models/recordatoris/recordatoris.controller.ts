import { Request, Response } from 'express';
import RecordatorisService from './recordatoris.service';

export default class RecordatorisController {
  static async create(req: Request, res: Response) {
    try {
      const recordatori = await RecordatorisService.create(req.body);
      return res.status(201).json(recordatori);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  static async findAll(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const recordatoris = await RecordatorisService.findAll(userId);
      return res.json(recordatoris);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  static async findById(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const recordatori = await RecordatorisService.findById(id);
      if (!recordatori)
        return res.status(404).json({ error: 'Recordatori no trobat' });
      return res.json(recordatori);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const updateData = req.body;
      const updated = await RecordatorisService.update(id, updateData);
      return res.json(updated);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = req.params.id;
      await RecordatorisService.delete(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }
}
