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
import cors from "cors";
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { verifyAccessToken } from 'utils/jwt.utils';

dotenv.config();

// Configuración de Express
const app = express();
app.use(express.json());
app.use(cookieParser());

// Configuración global de CORS
app.use(
  cors({
    origin: [process.env.FRONTEND_URL || "http://localhost:3000", process.env.BACKOFFICE_URL|| "http://localhost:4200"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    credentials: true
  })
);

// Conexión a la base de datos
connectDB.connect();

// Configuración de Swagger
setupSwagger(app);

app.use('/users', userRoutes); // Rutas de usuarios
app.use('/auth', authRoutes); // Rutas de autenticación
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

const httpServer = http.createServer(app);

// -------------------- SERVIDOR DE CHAT SOCKET.IO --------------------
// Puerto específico para el servidor de chat
const SOCKET_PORT = process.env.SOCKET_PORT || 3001;

// Crear servidor HTTP para el chat
const chatServer = http.createServer();

// Configurar Socket.IO para el chat con CORS
const chatIO = new Server(chatServer, {
    cors: {
        origin: '*', // Permitir cualquier origen (ajustar en producción)
        methods: ['GET', 'POST'],
        credentials: true
    }
});

/*Llistat per gestionar qui està connectat en cada moment, la idea seria poder agafar això i en rebre un missatge, 
mirar si la persona per a qui va dirigida està o no connectada, si ho està, enviem per socket, si no ho està,
guardar-lo a la BBDD. Llavors, podríem mirar d'implementar també alguna lògica de notificacions o alguna cosa similar.
*/
const connectedUsers = new Map();

// Manejar conexiones de Socket.IO para el chat
chatIO.on('connection', (socket) => {
  console.log(`Usuario conectado al chat: ${socket.id}`);

  // Verificación JWT para el socket principal
  socket.use(([event, ...args], next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('unauthorized'));
      try {
        verifyAccessToken(token);
        return next();
      } catch (err) {
        return next(new Error('unauthorized'));
      }
  });

  socket.on('error', (err) => {
    if (err && err.message == 'unauthorized') {
      console.debug('unauthorized user');
      socket.emit('status', { status: 'unauthorized' });
      socket.disconnect();
    }
  });
  /*Quan un user fa login, envia aquest missatge, automaticament es guarda a la llista de memoria local.
  En principi, jo no faria un broadcast per informar a la resta que aquest user s'ha connectat, perq no se si
  te sentit per la app.
  */
  socket.on('user_login', (userName) => {
    console.log(`User ${userName} logged in with socket ${socket.id}`);
    connectedUsers.set(socket.id, userName);
  });

  // Manejar desconexión, ara no només cal informar, també cal extreure aquesta persona de la llista
  socket.on('disconnect', () => {
    const userName = connectedUsers.get(socket.id);
    connectedUsers.delete(socket.id);
    console.log(`Usuario desconectado del chat: ${socket.id} (${userName})`);
  });
});

// Iniciar el servidor de chat
chatServer.listen(SOCKET_PORT, () => {
    console.log(`Servidor de sockets escoltant per: http://localhost:${SOCKET_PORT}`);
});
