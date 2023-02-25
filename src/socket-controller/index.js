import { Server } from 'socket.io';

import messageController from './messageController.js';

export default function connectSocket(server) {
  const io = new Server(5501, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    console.log('Connected: ', socket.id);

    messageController(io, socket);
  });
}
