import { Op } from 'sequelize';
import catchAsync from '../utils/catchAsync.js';
import ErrorResponse from '../utils/errorResponse.js';

class userController {
  static getUserData = catchAsync(async (req, res, next) => {
    const user = req.user;
    const { user_id } = req.query;

    const [follower_count, following_count, post_count] = await Promise.all([
      global.DB.Follower.count({
        where: {
          user_id: user_id ? user_id : user.id,
        },
      }),
      global.DB.Follower.count({
        where: {
          follower_id: user_id ? user_id : user.id,
        },
      }),
      global.DB.Post.count({
        where: { user_id: user_id ? user_id : user.id, status: 1 },
      }),
    ]);
    let responseObj = {
      success: true,
      message: 'User Fetched Successfully!!',
      response: {
        follower_count,
        following_count,
        post_count,
        user,
        selfProfile: true,
        isFollowing: false,
      },
    };

    if (!user_id || user_id == user.id) {
      await user.reload({ attributes: ['phoneNumber'] });
      responseObj.response = {
        ...responseObj.response,
        user,
        selfProfile: true,
        isFollowing: false,
      };
      return res.status(200).send(responseObj);
    }
    const userData = await global.DB.User.findOne({ where: { id: user_id } });
    if (!userData)
      return ErrorResponse({ message: 'User not found' }, 404, res);

    const followingCheck = await global.DB.Follower.findOne({
      where: { user_id: userData.id, follower_id: user.id },
    });

    responseObj.response = {
      ...responseObj.response,
      user: userData,
      selfProfile: false,
      isFollowing: Boolean(followingCheck),
    };
    return res.status(200).send(responseObj);
  });

  static updateUserData = catchAsync(async (req, res, next) => {
    const user = req.user;

    const { full_name, user_name, phoneNumber } = req.body;
    let email = req.body.email ? req.body.email.toLowerCase() : req.body.email;

    const updateObj = {};
    if (email && email != user.email) {
      updateObj['email'] = email;
      updateObj['isEmailVerified'] = false;
    }
    if (full_name && full_name != user.full_name) {
      updateObj['full_name'] = full_name;
    }
    if (phoneNumber && phoneNumber != user.phoneNumber) {
      if (phoneNumber.length != 10)
        return ErrorResponse(
          { message: 'Please Enter a Valid Phone Number!!' },
          400,
          res
        );
      updateObj['phoneNumber'] = phoneNumber;
    }
    if (user_name && user_name != user.user_name) {
      const checkUserName = await User.findOne({
        where: {
          user_name: user_name,
          id: { [Op.ne]: user.id },
        },
        attributes: ['id'],
      });

      if (checkUserName)
        return ErrorResponse(
          {
            message: 'This UserName is already taken. Try different UserName.',
          },
          400,
          res
        );
      updateObj['user_name'] = user_name;
    }

    await user.update(updateObj);
    await user.reload();
    res.status(200).send({
      success: true,
      message: 'User Updated Successfully!!',
      response: {
        user,
      },
    });
  });

  static getUsersByUserName = catchAsync(async (req, res, next) => {
    const user = req.user;
    const { user_name } = req.query;

    if (!user_name)
      res.status(200).send({
        success: true,
        message: 'User data fetched Successfully!!',
        response: { users: [] },
      });
    const users = await global.DB.User.findAll({
      where: {
        user_name: { [Op.like]: `%${user_name}%` },
        id: { [Op.ne]: user.id },
      },
      attributes: ['id', 'full_name', 'user_name'],
    });

    res.status(200).send({
      success: true,
      message: 'User data fetched Successfully!!',
      response: { users },
    });
  });
}

export default userController;
