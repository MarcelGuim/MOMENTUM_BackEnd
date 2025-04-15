import express from 'express';
import userRoutes from './models/users/user.routes';
import chatRoutes from './models/chats/chat.routes';
import calendarRoutes from './models/calendari/calendar.routes'; // Importa las rutas de Calendar
import locationRoutes from './models/location/location.routes';
import workersRoutes from './models/worker/worker.routes'; // Importa las rutas de Workers
import businessRoutes from './models/business/business.routes';
import connectDB from './database';
import { setupSwagger } from './swagger';
import cors from "cors";
import cookieParser from 'cookie-parser';

import dotenv from 'dotenv';
dotenv.config();

// Configuración de Express
const app = express();
app.use(express.json());
app.use(cookieParser());

// Configuración global de CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true // This is crucial for cookies to work cross-origin
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
app.use('/workers', workersRoutes); // Rutas de ubicaciones
app.use('/business', businessRoutes); // Rutas de ubicaciones

const PORT = process.env.PORT || 8080; // Use env variable or fallback
const BASE_URL = process.env.APP_BASE_URL || `http://localhost:${PORT}`;

app.listen(PORT, () => {
    console.log(`Servidor en marxa a ${BASE_URL}`);
    console.log(`Documentació Swagger a ${BASE_URL}/Swagger`);
});
