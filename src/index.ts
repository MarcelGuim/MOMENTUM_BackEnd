import express from 'express';
import userRoutes from './models/users/user.routes';
import chatRoutes from './models/chats/chat.routes';
import connectDB from './database';
import { setupSwagger } from './swagger'; 
import { CalendarService } from './models/calendari/calendar.services';
import Appointment, { IAppointment } from './models/appointment/appointment.model';
import Calendar, { ICalendar } from './models/calendari/calendar.model'
import User, {IUsuari} from './models/users/user.model';
/*
async function cosa(){
  const calendarService = new CalendarService;
  const app1:IAppointment = {
    inTime: new Date(2025, 2, 6, 14, 30),
    outTime:new Date(2025, 2, 6, 15, 30),
    place:'Barcelona',
    title:'Uni',
  }
  const app2 = new Appointment(app1)
  const app1Saved =  await app2.save()

  const calendarService2 = new CalendarService;
  const app3:IAppointment = {
    inTime: new Date(2025, 2, 7, 17, 30),
    outTime:new Date(2025, 2, 7, 18, 30),
    place:'Barcelona',
    title:'Uni',
  }
  const app4 = new Appointment(app3)
  const app3Saved =  await app4.save()
  const user1 = await User.findOne({name:"Marcel"}) as unknown as IUsuari
  const calendar1:Partial<ICalendar> = {
    user:user1._id,
    appointments:[app1Saved._id, app3Saved._id]
  }
  const calendar = await calendarService.createCalendar(calendar1);
  const uououo = await calendarService.getAppointmentsForADay(new Date(2025, 2, 7), "Marcel");
  console.log(uououo)
}

cosa()
*/
const app = express();
app.use(express.json());

app.use('/users', userRoutes);
app.use('/chat', chatRoutes);

connectDB.connect();
const PORT = 8080;

setupSwagger(app);

app.listen(PORT, () => {
    console.log('Servidor en marxa a http://localhost:8080');
    console.log('Documentació Swagger a http://localhost:8080/Swagger');
  });