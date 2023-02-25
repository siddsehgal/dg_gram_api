export default function messageController(io, socket) {
  // Join Room
  socket.on('JoinRoomWithUser', (data) => {
    // console.log('JoinRoomWithUser');
    const { user_id, my_id } = data;
    const room = getUsersRoom([user_id, my_id]);
    socket.join(room);
  });

  //   Handle New Message
  socket.on('UserSentAMessage', async (data) => {
    // console.log('UserSentAMessage');
    const { user_id, message, users_room_id, my_id } = data;
    const room = getUsersRoom([user_id, my_id]);

    const chat = await saveMessage({ from: my_id, message, users_room_id });

    io.to(room).emit('UserReceivedAMessage', { chat });
  });
}

async function saveMessage(data) {
  const { from, message, users_room_id } = data;
  return await global.DB.Chat.create({ message, from, room_id: users_room_id });
}

function getUsersRoom(arr) {
  const users = arr.sort((a, b) => a - b);
  return users.join(',');
}
