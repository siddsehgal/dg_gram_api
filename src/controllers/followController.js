import catchAsync from '../utils/catchAsync.js';
import ErrorResponse from '../utils/errorResponse.js';

class followController {
  // Follow a User API
  static follow = catchAsync(async (req, res, next) => {
    // User Id of User to Follow
    const { user_id } = req.query;

    // Fetch User from JWT
    const user = req.user;

    // Check if User Exist with the User Id
    const checkUser = await global.DB.User.findOne({ where: { id: user_id } });
    if (!checkUser)
      return ErrorResponse({ message: 'user Not Found!!' }, 404, res);

    // Check if they already follow
    const isAlreadyFollowed = await global.DB.Follower.findOne({
      where: {
        user_id,
        follower_id: user.id,
      },
    });
    if (isAlreadyFollowed)
      return ErrorResponse({ message: 'Already Following' }, 400, res);

    // Creating Entry for Follow in the Database
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

  // Unfollow a User API
  static unFollow = catchAsync(async (req, res, next) => {
    // User Id of User to Un-Follow
    const { user_id } = req.query;

    // Fetch User from JWT
    const user = req.user;

    // Check if they are following or not
    const isAlreadyFollowed = await global.DB.Follower.findOne({
      where: {
        user_id: user_id,
        follower_id: user.id,
      },
    });
    // If Not Following then Throw Error
    if (!isAlreadyFollowed)
      return ErrorResponse({ message: 'Not already Following' }, 400, res);

    // Delete Follow Entry from Database
    await isAlreadyFollowed.destroy();

    res.send({
      success: true,
      message: 'Un-Followed Successfully',
    });
  });
}

export default followController;
