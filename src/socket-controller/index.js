import { Server } from 'socket.io';
import messageController from './messageController.js';

export default function connectSocket(httpServer) {
  // Initializing Socket from the Http Server
  const io = new Server(httpServer, { cors: { origin: '*' } });

  // Handling new Socket Connection
  io.on('connection', (socket) => {
    console.log('Connected: ', socket.id);

    // Messaging Related Socket Events
    messageController(io, socket);
  });
}
