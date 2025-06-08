import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.utils';
import { typeOfXatUser } from '../enums/typesOfXat.enum';
import {
  JoinRoomRequest,
  SocketMessage,
  TypingSocketMessage,
} from 'types/index';

//const chatService = new ChatService();
const connectedUsers = new Map<string, string>();
/*Llistat per gestionar qui està connectat en cada moment, la idea seria poder agafar això i en rebre un missatge, 
mirar si la persona per a qui va dirigida està o no connectada, si ho està, enviem per socket, si no ho està,
guardar-lo a la BBDD. Llavors, podríem mirar d'implementar també alguna lògica de notificacions o alguna cosa similar.
*/

export function configureSocketEvents(socketIo: Server) {
  socketIo.on('connection', (socket: Socket) => {
    console.log(`Nou client connectat: ${socket.id}`);

    socket.use((_, next) => {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('unauthorized'));
      try {
        verifyAccessToken(token);
        console.log('user authorized');
        return next();
      } catch {
        console.log('error, user was not authorised');
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
    socket.on('user_login', (userId) => {
      console.debug('user registered to websocket with id ' + userId);
      connectedUsers.set(socket.id, userId);
    });

    socket.on('join_rooms', (data: JoinRoomRequest) => {
      console.debug(`client ${data.userId} joining rooms ${data.rooms}`);
      data.rooms.forEach((room) => {
        socket.join(room);
      });
    });

    socket.on('test', () => {
      socket.emit('test', 'response to test');
    });

    socket.on('new_message', async (data: SocketMessage) => {
      let socketId: string | null = '';
      switch (data.receiverType) {
        case typeOfXatUser.USER:
        case typeOfXatUser.WORKER:
          socketId = await getSocketFromUserId(data.receiverId);
          if (socketId) {
            const socket2 = await socketIo.sockets.sockets.get(socketId);
            if (socket2) {
              socket2.emit('new_message', data);
            }
          }
          break;
        case typeOfXatUser.LOCATION:
          socketIo.to('location/' + data.receiverId).emit('new_message', data);
          break;
        case typeOfXatUser.BUSINESS:
          socketIo.to('business/' + data.receiverId).emit('new_message', data);
          break;
      }
    });

    socket.on('typing', async (data: TypingSocketMessage) => {
      let socketId: string | null = '';
      switch (data.receiverType) {
        case typeOfXatUser.USER:
        case typeOfXatUser.WORKER:
          socketId = await getSocketFromUserId(data.receiverId);
          if (socketId) {
            const socket2 = await socketIo.sockets.sockets.get(socketId);
            if (socket2) {
              socket2.emit('typing', data.chatId);
            }
          }
          break;
        case typeOfXatUser.LOCATION:
          socketIo.to('location/' + data.receiverId).emit('typing', data);
          break;
        case typeOfXatUser.BUSINESS:
          socketIo.to('business/' + data.receiverId).emit('typing', data);
          break;
      }
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(socket.id);
    });
  });
}

async function getSocketFromUserId(userId: string) {
  for (const [socketId, storedUserId] of connectedUsers) {
    if (storedUserId === userId) {
      return socketId;
    }
  }
  return null;
}
