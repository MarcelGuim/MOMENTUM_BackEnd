import http from 'http';
import { Server, Socket } from 'socket.io';
import { configureSocketEvents } from './socket_service';

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:4200',
  'http://ea5-api.upc.edu'
];

export async function startSocketServer(httpServer: http.Server) {
  const socketIO = new Server(httpServer, {
    cors: {
      origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
      credentials: true
    }
  });

  configureSocketEvents(socketIO);
}
