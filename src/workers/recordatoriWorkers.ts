import { Worker } from 'bullmq';
import { connection } from '../queues';

let reminderWorker: Worker | null = null;
try {
  reminderWorker = new Worker(
    'reminder-queue',
    async (job) => {
      console.log('Worker iniciat amb job:', job.id);
      console.log('Dades del job:', job.data);
      const { title, description } = job.data;
      console.log('Recordatori: ' + title + ' - ' + description);
    },
    { connection }
  );
  reminderWorker.on('completed', (job) => {
    console.log(' Job completat: ' + job.id);
  });

  reminderWorker.on('failed', (job, err) => {
    console.error(' Job fallat: ' + job?.id + ', ' + err);
  });
} catch (error) {
  console.error('Error al crear el Worker:', error);
}

export default reminderWorker;
