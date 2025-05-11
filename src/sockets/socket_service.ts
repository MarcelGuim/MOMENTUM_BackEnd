import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.utils';
import { ChatService } from '../models/chats/chat.services';

const chatService = new ChatService();
const connectedUsers = new Map<string, string>;
/*Llistat per gestionar qui està connectat en cada moment, la idea seria poder agafar això i en rebre un missatge, 
mirar si la persona per a qui va dirigida està o no connectada, si ho està, enviem per socket, si no ho està,
guardar-lo a la BBDD. Llavors, podríem mirar d'implementar també alguna lògica de notificacions o alguna cosa similar.
*/

export function configureSocketEvents(socketIo: Server) {
  socketIo.on('connection', (socket: Socket) => {
    console.log(`Nou client connectat: ${socket.id}`);
    // Verificación JWT para el socket principal
    socket.use(([event, ...args], next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('unauthorized'));
      try {
        verifyAccessToken(token);
        return next();
      } catch (err) {
        console.log("error, user was not authorised");
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
        console.log(connectedUsers);
    });

    socket.on('test', (message: String) => {
        console.log("socket emited test mesage: " + message);
        socket.emit('test', 'response to test');
    });

    /* socket.on('new_message', (chatId: String, userName: String, message: String) => { 
    }); */
    socket.on('new_message', async (data) => {
      console.log('Missatge rebut:', data);
      const otherUser = await chatService.getNameFromOtherPersonInChat(data.chatId, data.sender)
      const socketId = await getSocketFromUserName(otherUser as string);
      if (socketId) {
        const socket2 =await socketIo.sockets.sockets.get(socketId);
        if (socket2) {
          socket2.emit('new_message', data);
        }
      }
      console.log(otherUser);
    });

    socket.on('disconnect', () => {
        const userName = connectedUsers.get(socket.id);
        connectedUsers.delete(socket.id);
        console.log(`Usuario desconectado del chat: ${socket.id} (${userName})`);
    });
  });
}

async function getSocketFromUserName(userName: string) {
    for (const [socketId, storedUserName] of connectedUsers) {
        if (storedUserName === userName) {
            return socketId;
        }
    }
    return null;
}