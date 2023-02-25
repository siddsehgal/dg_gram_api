import jwt from 'jsonwebtoken';
import axios from 'axios';
import { Op } from 'sequelize';
import catchAsync from '../utils/catchAsync.js';
import ErrorResponse from '../utils/errorResponse.js';

class followController {
  // Follow a User
  static follow = catchAsync(async (req, res, next) => {
    const { user_id } = req.query;
    const user = req.user;

    const checkUser = await global.DB.User.findOne({ where: { id: user_id } });
    if (!checkUser)
      return ErrorResponse({ message: 'user Not Found!!' }, 404, res);

    const isAlreadyFollowed = await global.DB.Follower.findOne({
      where: {
        user_id,
        follower_id: user.id,
      },
    });

    if (isAlreadyFollowed)
      return ErrorResponse({ message: 'Already Following' }, 400, res);

    const follow = await global.DB.Follower.create({
      user_id: Number(user_id),
      follower_id: user.id,
    });

    res.status(200).json({
      success: true,
      message: 'User Followed Successfully',
      response: { follow },
    });
  });

  // Unfollow a User
  static unFollow = catchAsync(async (req, res, next) => {
    const { user_id } = req.query;
    const user = req.user;

    const isAlreadyFollowed = await global.DB.Follower.findOne({
      where: {
        user_id: user_id,
        follower_id: user.id,
      },
    });

    if (!isAlreadyFollowed)
      return ErrorResponse({ message: 'Not already Following' }, 400, res);

    await isAlreadyFollowed.destroy();

    res.send({
      success: true,
      message: 'Un-Followed Successfully',
    });
  });

  //   // Get Following Users List
  //   static followingUsers = catchAsync(async (req, res, next) => {
  //     const followingUsers = await global.DB.Follower.findAll({
  //       where: {
  //         follower_id: req.user.id,
  //         status: '1',
  //       },
  //       attributes: ['id', 'user_id', 'status'],
  //       include: [
  //         {
  //           model: global.DB.User,
  //           as: 'user',
  //           attributes: ['id', 'name', 'user_name'],
  //         },
  //       ],
  //     });

  //     res.send({
  //       status: 'success',
  //       message: 'UnFolllowed Successfully',
  //       followingUsers,
  //     });
  //   });
}

export default followController;
