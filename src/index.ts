import express from 'express';
import userRoutes from './models/users/user.routes';
import chatRoutes from './models/chats/chat.routes';
import connectDB from './database';
import { setupSwagger } from './swagger'; 
import { CalendarService } from './models/calendari/calendar.services';

const calendarService = new CalendarService;
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