import { Op, fn, col, literal } from 'sequelize';
import catchAsync from '../utils/catchAsync.js';
import ErrorResponse from '../utils/errorResponse.js';

class chatController {
  // Get Room from Array of User Ids
  static getUsersRoom = (arr) => {
    const users = arr.sort((a, b) => a - b);
    return users.join(',');
  };

  // Get User Messages API
  static getUserChat = catchAsync(async (req, res, next) => {
    // Fetch User from JWT
    const user = req.user;

    // User Id of other User
    const { user_id } = req.query;

    // Basic Non Empty Validation
    if (!user_id)
      return ErrorResponse({ message: 'User_id Is Required' }, 404, res);

    // Get Users Room String
    const room = this.getUsersRoom([user.id, user_id]);

    //  Check if room exists
    // Fetch User Data
    let [usersRoom, userData] = await Promise.all([
      global.DB.UsersRoom.findOne({
        where: { users: room },
      }),
      global.DB.User.findOne({
        where: { id: user_id },
        attributes: ['id', 'full_name', 'user_name'],
      }),
    ]);

    // If No Room the Create New Room
    if (!usersRoom) {
      usersRoom = await global.DB.UsersRoom.create({ users: room });
    }

    // Fetch Chat Messages from Database
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

  // Get User List API
  static getChatUsersList = catchAsync(async (req, res, next) => {
    // Fetched User from JWT
    const user = req.user;

    // Find all Room of this User
    const usersRoom = await global.DB.UsersRoom.findAll({
      where: {
        [Op.and]: [fn('FIND_IN_SET', user.id, col('users'))],
      },
    });

    // Fetched Last Message from each Room
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

    // Extract Unique User Ids from Chat data
    const userArr = messages.map((item) => {
      return item.room_data.users.split(',').filter((i) => i != user.id)[0];
    });

    // Fetch Users Data
    const usersData = await global.DB.User.findAll({
      where: { id: { [Op.in]: userArr } },
      attributes: ['id', 'full_name', 'user_name'],
    });

    // Link User and Chat Data Together
    usersData.forEach((item, index) => {
      item.setDataValue('message', messages[index].message);
    });

    res.status(200).send({
      success: true,
      message: 'User data fetched Successfully!!',
      response: {
        users: usersData,
      },
    });
  });
}

export default chatController;
