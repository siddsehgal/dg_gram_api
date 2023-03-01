export default function messageController(io, socket) {
  // Handle Join Room
  socket.on('JoinRoomWithUser', (data) => {
    const { user_id, my_id } = data;
    const room = getUsersRoom([user_id, my_id]);

    // Joining the Client in the Chat Room with the user
    socket.join(room);
  });

  //   Handle New Message
  socket.on('UserSentAMessage', async (data) => {
    const { user_id, message, users_room_id, my_id } = data;
    const room = getUsersRoom([user_id, my_id]);

    // Saving Message in DB
    const chat = await saveMessage({ from: my_id, message, users_room_id });

    // Emitting the Message to the room
    io.to(room).emit('UserReceivedAMessage', { chat });
  });
}

async function saveMessage(data) {
  // Saving Message in the Database
  const { from, message, users_room_id } = data;
  return await global.DB.Chat.create({ message, from, room_id: users_room_id });
}

function getUsersRoom(arr) {
  // Generate Room String from Array of User Ids
  const users = arr.sort((a, b) => a - b);
  return users.join(',');
}
