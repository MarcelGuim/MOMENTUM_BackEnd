import Recordatoris, { IRecordatoris } from './recordatoris.models';
import mongoose from 'mongoose';
import { reminderQueue } from '../../queues';
import { CronExpression } from '../../utils/cronHelpter';
import { RepetitionType } from '../../enums/recordatorisRepetition.enum';
import { DateTime } from 'luxon';

export default class RecordatorisService {
  static async create(recordatoriData: IRecordatoris) {
    const recordatori = new Recordatoris(recordatoriData);
    const saved = await recordatori.save();

    const { time, repeat } = saved;

    const jobData = {
      recordatoriId: saved._id.toString(),
      title: saved.title,
      description: saved.description,
    };
    console.log('Recordatori a crear:', jobData);

    if (repeat === RepetitionType.NEVER) {
      const barcelonaTime = DateTime.fromJSDate(time).setZone('Europe/Madrid');
      const now = DateTime.now().setZone('Europe/Madrid');
      const delay = barcelonaTime.toMillis() - now.toMillis();
      console.log('delay:', delay);
      if (delay > 0) {
        console.log('programant recordatori només un sol cop');
        await reminderQueue.add('sendReminder', jobData, {
          delay,
          jobId: saved._id.toString(),
        });
        console.log('Ha fet alguna cosa');
      } else {
        console.warn('Temps passat — no es programa el job');
      }
    } else {
      const cron = CronExpression.fromDateAndRepeat(time, repeat);
      if (cron) {
        await reminderQueue.add('sendReminder', jobData, {
          repeat: { cron } as any,
          jobId: saved._id.toString(),
        });
      } else {
        throw new Error('Cron no generat per aquest tipus de repetició');
      }
    }

    return saved;
  }

  static async findAll(userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId))
      throw new Error('ID no vàlid');
    return await Recordatoris.find({ user: userId }).sort({ time: 1 });
  }

  static async findById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('ID no vàlid');
    }
    return await Recordatoris.findById(id);
  }

  static async update(id: string, updateData: Partial<IRecordatoris>) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('ID no vàlid');
    }
    const updated = await Recordatoris.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updated) throw new Error('Recordatori no trobat');

    const oldJob = await reminderQueue.getJob(id);
    if (oldJob) {
      await oldJob.remove();
    }

    const { time, repeat } = updated;

    const jobData = {
      recordatoriId: updated._id.toString(),
      title: updated.title,
      description: updated.description,
    };

    if (repeat === RepetitionType.NEVER) {
      const delay = time.getTime() - Date.now();
      if (delay > 0) {
        await reminderQueue.add('sendReminder', jobData, {
          delay,
          jobId: updated._id.toString(),
        });
      } else {
        console.warn('Nou temps passat — no es programa el job');
      }
    } else {
      const cron = CronExpression.fromDateAndRepeat(time, repeat);
      if (cron) {
        await reminderQueue.add('sendReminder', jobData, {
          repeat: { cron } as any,
          jobId: updated._id.toString(),
        });
      } else {
        throw new Error('No s’ha pogut generar el cron');
      }
    }
    return updated;
  }

  static async delete(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('ID no vàlid');
    }
    const job = await reminderQueue.getJob(id);
    if (job) {
      await job.remove();
    }
    return await Recordatoris.findByIdAndDelete(id);
  }
}
