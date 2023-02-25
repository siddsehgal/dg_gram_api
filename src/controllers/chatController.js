import { Op, fn, col, literal } from 'sequelize';
import catchAsync from '../utils/catchAsync.js';
import ErrorResponse from '../utils/errorResponse.js';

class chatController {
  static getUsersRoom = (arr) => {
    const users = arr.sort((a, b) => a - b);
    return users.join(',');
  };
  // Follow a User
  static getUserChat = catchAsync(async (req, res, next) => {
    const user = req.user;

    const { user_id } = req.query;
    if (!user_id)
      return ErrorResponse({ message: 'User_id Is Required' }, 404, res);
    const room = this.getUsersRoom([user.id, user_id]);
    let usersRoom = await global.DB.UsersRoom.findOne({
      where: { users: room },
    });

    const userData = await global.DB.User.findOne({
      where: { id: user_id },
      attributes: ['id', 'full_name', 'user_name'],
    });

    if (!usersRoom) {
      usersRoom = await global.DB.UsersRoom.create({ users: room });
    }

    const chats = await global.DB.Chat.findAll({
      where: { room_id: usersRoom.id },
    });

    return res.status(200).send({
      success: true,
      message: 'Chats Fetched Successfully',
      response: {
        chats,
        users_room_id: usersRoom.id,
        user_id: user.id,
        userData,
      },
    });
  });

  static getChatUsersList = catchAsync(async (req, res, next) => {
    const user = req.user;

    const usersRoom = await global.DB.UsersRoom.findAll({
      where: {
        [Op.and]: [fn('FIND_IN_SET', user.id, col('users'))],
      },
    });

    const messages = await global.DB.Chat.findAll({
      where: { room_id: { [Op.in]: usersRoom.map((item) => item.id) } },
      attributes: [
        'room_id',
        [
          literal(
            '(select message from chats where room_id = Chat.room_id order by created_at desc limit 1)'
          ),
          'message',
        ],
      ],
      include: {
        model: global.DB.UsersRoom,
        as: 'room_data',
        attributes: ['id', 'users'],
      },
      group: ['room_id'],
    });
    const userArr = messages.map((item) => {
      return item.room_data.users.split(',').filter((i) => i != user.id)[0];
    });

    const usersData = await global.DB.User.findAll({
      where: { id: { [Op.in]: userArr } },
      attributes: ['id', 'full_name', 'user_name'],
    });

    usersData.forEach((item, index) => {
      item.setDataValue('message', messages[index].message);
    });

    res.status(200).send({
      success: true,
      message: 'User data fetched Successfully!!',
      response: {
        // usersRoom, userArr,
        users: usersData,
        // messages,
      },
    });
  });
}

export default chatController;
