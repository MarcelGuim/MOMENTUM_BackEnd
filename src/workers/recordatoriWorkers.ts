import { Worker } from 'bullmq';
import { connection } from '../queues';
import Recordatoris, {
  IRecordatoris,
} from '../models/recordatoris/recordatoris.models';
import User, { IUsuari } from '../models/users/user.model';
import { getMessaging } from 'firebase-admin/messaging';
import mongoose from 'mongoose';
import admin from 'firebase-admin';
import serviceAccount from '../firebase/momentumapp-73123-firebase-adminsdk-fbsvc-b0622154fc.json';

let reminderWorker: Worker | null = null;
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

(async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/momentum';
    console.log(mongoUri);
    await mongoose.connect(mongoUri);

    reminderWorker = new Worker(
      'reminder-queue',
      async (job) => {
        console.log('Iniciant el Worker per enviar recordatoris');
        const { recordatoriId, title, description } = job.data;
        const recordatori: IRecordatoris | null =
          await Recordatoris.findById(recordatoriId);
        if (!recordatori) {
          throw new Error('Recordatori no trobat');
        }
        const user: IUsuari | null = await User.findById(recordatori.user);
        if (!user) {
          throw new Error('Usuari no trobat');
        }
        if (!user.fcmToken) {
          throw new Error('Usuari sense token FCM');
        }
        await getMessaging().send({
          token: user.fcmToken,
          notification: {
            title: `Nou recordatori: ${title}`,
            body: `Tens un nou recordatori: ${description}`,
          },
          data: {
            type: 'recordatori',
            title,
            description,
          },
        });
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
})();

export default reminderWorker;
