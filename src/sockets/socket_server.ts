import http from 'http';
import { Server, Socket } from 'socket.io';
import { configureSocketEvents } from './socket_service';


export async function startSocketServer(app: any, port: String) {

    const socketServer = http.createServer(app);

    const socketIO = new Server(socketServer, {
        cors: {
            origin: '*', // Permitir cualquier origen (ajustar en producción)
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    configureSocketEvents(socketIO); // <- Aquí es connecta la lògica

    socketServer.listen(port, () => {
    console.log(`Servidor de sockets escoltant per: http://localhost:${port}`);
    });
}
