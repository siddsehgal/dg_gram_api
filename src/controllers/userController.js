import { Op } from 'sequelize';
import catchAsync from '../utils/catchAsync.js';
import ErrorResponse from '../utils/errorResponse.js';
import { sendEmail } from '../utils/sendEmail.js';
class userController {
  // Get User Data API
  static getUserData = catchAsync(async (req, res, next) => {
    const { user_id } = req.query;

    // Fetch User from JWT
    const user = req.user;

    // Fetching 'Follower Count', 'Following Count', 'Post Count' from Database
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

    // Generate Response Object
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

    // If No User Id is provided then Send Res Obj for Self User
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

    // If User Id is Provided in the Query
    // then Fetch that user from Database
    const userData = await global.DB.User.findOne({ where: { id: user_id } });

    // Throw Error if No User was found
    if (!userData)
      return ErrorResponse({ message: 'User not found' }, 404, res);

    // Check if the Users are Following Each-Other
    const followingCheck = await global.DB.Follower.findOne({
      where: { user_id: userData.id, follower_id: user.id },
    });

    // Send Final Res Object
    responseObj.response = {
      ...responseObj.response,
      user: userData,
      selfProfile: false,
      isFollowing: Boolean(followingCheck),
    };
    return res.status(200).send(responseObj);
  });

  // Update User Data API
  static updateUserData = catchAsync(async (req, res, next) => {
    // Fetch User from JWT
    const user = req.user;

    // Destructure Property from Request Body
    const { full_name, user_name, phoneNumber } = req.body;

    // Convert Email to LowerCase
    let email = req.body.email ? req.body.email.toLowerCase() : req.body.email;

    // Initialize Empty Update Object
    const updateObj = {};

    // If User Changes their Email Address
    if (email && email != user.email) {
      // Check if other user has the same email
      const checkUser = await global.DB.User.findOne({
        where: { id: { [Op.ne]: user.id }, email },
        attributes: ['id'],
      });
      // if yes then send Error
      if (checkUser)
        return ErrorResponse(
          { message: 'Another User already exist with this email!!' },
          400,
          res
        );
      // Add Email to Update Object
      updateObj['email'] = email;

      // Update Email Verified to false
      updateObj['isEmailVerified'] = false;

      // Generating a OTP
      const OTP = Math.floor(100000 + Math.random() * 900000);

      // Update Otp in Database
      updateObj['OTP'] = OTP;

      // Send Mail
      sendEmail({
        from: process.env.MY_EMAIL,
        to: email,
        subject: 'Email Verification',
        text: `Verify your Email Using OTP: ${OTP}`,
      });
    }

    // If User Changes his Full Name
    // then Add Full Name to Update Object
    if (full_name && full_name != user.full_name) {
      updateObj['full_name'] = full_name;
    }

    // If User Changes his Full Name
    // then Add Full Name to Update Object
    if (phoneNumber && phoneNumber != user.phoneNumber) {
      // Basic Validation for Phone Number
      if (phoneNumber.length != 10)
        return ErrorResponse(
          { message: 'Please Enter a Valid Phone Number!!' },
          400,
          res
        );

      // Check if other User has same Phone Number
      const checkUser = await global.DB.User.findOne({
        where: {
          phoneNumber,
          id: { [Op.ne]: user.id },
        },
        attributes: ['id'],
      });
      // Then Throw an ErrorResponse
      if (checkUser)
        return ErrorResponse(
          {
            message: 'Another User already exists with the same phone number!',
          },
          400,
          res
        );

      // Add Phone Number in Update Object
      updateObj['phoneNumber'] = phoneNumber;
    }

    // If User changes his User Name
    if (user_name && user_name != user.user_name) {
      // Check if other User has same User Name
      const checkUserName = await global.DB.User.findOne({
        where: {
          user_name: user_name,
          id: { [Op.ne]: user.id },
        },
        attributes: ['id'],
      });
      // Then Throw an ErrorResponse
      if (checkUserName)
        return ErrorResponse(
          {
            message: 'This UserName is already taken. Try different UserName.',
          },
          400,
          res
        );

      // Add Phone Number in Update Object
      updateObj['user_name'] = user_name;
    }

    // Update User in Database
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

  // Get User By User Name API
  static getUsersByUserName = catchAsync(async (req, res, next) => {
    // Fetched User from JWT
    const user = req.user;

    const { user_name } = req.query;

    // Basic Non Empty Validation
    if (!user_name)
      return res.status(200).send({
        success: true,
        message: 'User data fetched Successfully!!',
        response: { users: [] },
      });

    // Fetch User with matching User Name from Database
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
