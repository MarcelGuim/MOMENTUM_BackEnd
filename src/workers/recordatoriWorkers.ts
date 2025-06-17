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
import { configDotenv } from 'dotenv';

configDotenv();

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
    console.log('Conexió a MongoDB establerta amb èxit');
    const user = await User.findOne({ name: 'Marcel' });
    console.log('Usuari trobat:', user?.mail);
    reminderWorker = new Worker(
      'reminder-queue',
      async (job) => {
        console.log('Iniciant el Worker per enviar recordatoris');
        const { recordatoriId, title, description } = job.data;
        console.log(recordatoriId, title, description);
        const recordatori: IRecordatoris | null =
          await Recordatoris.findById(recordatoriId);
        if (!recordatori) {
          console.error('Recordatori no trobat:', recordatoriId);
          throw new Error('Recordatori no trobat');
        }
        const user: IUsuari | null = await User.findById(recordatori.user);
        if (!user) {
          console.error('Usuari no trobat:', recordatori.user);
          throw new Error('Usuari no trobat');
        }
        if (!user.fcmToken) {
          console.error('Usuari sense token FCM:', user);
          throw new Error('Usuari sense token FCM');
        }
        console.log('Enviant notificació al token FCM:', user.fcmToken);
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
        console.log('Notificació enviada amb èxit');
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
