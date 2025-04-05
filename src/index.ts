import express from 'express';
import userRoutes from './models/users/user.routes';
import chatRoutes from './models/chats/chat.routes';
import calendarRoutes from './models/calendari/calendar.routes'; // Importa las rutas de Calendar
import locationRoutes from './models/location/location.routes';
import connectDB from './database';
import { setupSwagger } from './swagger';
import cors from "cors";
import { CalendarService } from './models/calendari/calendar.services';

// Configuración de Express
const app = express();
app.use(express.json());

// Configuración global de CORS
app.use(
  cors({
    origin: "http://localhost:4200", // Permite peticiones desde tu frontend en Angular
    methods: ["GET", "POST", "PUT", "DELETE","PATCH"], // Métodos permitidos
    allowedHeaders: ["Content-Type", "Authorization"], // Encabezados permitidos
  })
);

// Conexión a la base de datos
connectDB.connect();

// Configuración de Swagger
setupSwagger(app);

app.use('/users', userRoutes); // Rutas de usuarios
app.use('/chat', chatRoutes);  // Rutas de chats
app.use('/calendars', calendarRoutes); // Rutas de calendarios
app.use('/location', locationRoutes); // Rutas de ubicaciones

const PORT = 8080;
app.listen(PORT, () => {
    console.log('Servidor en marxa a http://localhost:8080');
    console.log('Documentació Swagger a http://localhost:8080/Swagger');
});
