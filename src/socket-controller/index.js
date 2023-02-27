import { Server } from 'socket.io';

import messageController from './messageController.js';

export default function connectSocket(httpServer) {
  const io = new Server(httpServer, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    console.log('Connected: ', socket.id);

    messageController(io, socket);
  });
}
