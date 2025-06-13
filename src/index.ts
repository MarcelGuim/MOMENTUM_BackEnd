import express from 'express';
import userRoutes from './models/users/user.routes';
import chatRoutes from './models/chats/chat.routes';
import calendarRoutes from './models/calendari/calendar.routes'; // Importa las rutas de Calendar
import locationRoutes from './models/location/location.routes';
import workersRoutes from './models/worker/worker.routes'; // Importa las rutas de Workers
import businessRoutes from './models/business/business.routes';
import authRoutes from './models/auth/auth.routes';
import connectDB from './database';
import { setupSwagger } from './swagger';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import http from 'http';
import { startSocketServer } from './sockets/socket_server';
import iaRoutes from './models/IA/IA.routes';
import recordatorisRoutes from './models/recordatoris/recordatoris.routes';
dotenv.config();

// Configuración de Express
const app = express();
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:4200',
  'http://localhost:8080',
  'http://ea5-api.upc.edu',
  'http://ea5.upc.edu',
  'http://ea5-back.upc.edu',
  'https://ea5-api.upc.edu',
  'https://ea5.upc.edu',
  'https://ea5-back.upc.edu',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    credentials: true,
  })
);

// Conexión a la base de datos
connectDB.connect();

// Configuración de Swagger
setupSwagger(app);

app.use('/users', userRoutes); // Rutas de usuarios
app.use('/auth', authRoutes); // Rutas de autenticación
app.use('/chat', chatRoutes); // Rutas de chats
app.use('/calendars', calendarRoutes); // Rutas de calendarios
app.use('/location', locationRoutes); // Rutas de ubicaciones
app.use('/workers', workersRoutes); // Rutas de ubicaciones
app.use('/business', businessRoutes); // Rutas de ubicaciones
app.use('/ia', iaRoutes);
app.use('/recordatoris', recordatorisRoutes);

const PORT = process.env.PORT || 8080; // Use env variable or fallback
const BASE_URL = process.env.APP_BASE_URL || `http://localhost:${PORT}`;
const httpServer = http.createServer(app);

startSocketServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Servidor en marxa a ${BASE_URL}`);
  console.log(`Documentació Swagger a ${BASE_URL}/Swagger`);
  console.log(`Servidor de sockets escoltant per: ${BASE_URL}`);
});
