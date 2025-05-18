import http from 'http';
import { Server, Socket } from 'socket.io';
import { configureSocketEvents } from './socket_service';


export async function startSocketServer(httpServer: any) {

    const socketIO = new Server(httpServer, {
        cors: {
            origin: '*', // Permitir cualquier origen (ajustar en producción)
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    configureSocketEvents(socketIO); // <- Aquí es connecta la lògica

}
