import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { sendEmail } from '../utils/sendEmail.js';
import catchAsync from '../utils/catchAsync.js';
import ErrorResponse from '../utils/errorResponse.js';

class authController {
  //SingUp  API
  static signup = catchAsync(async (req, res, next) => {
    const { full_name, email, password, confirmPassword } = req.body;

    // Basic Non Empty Validation
    if (!full_name || !email || !password || !confirmPassword)
      return ErrorResponse({ message: 'All Fields are Required!!' }, 400, res);

    // Compare 'Password' and 'Confirm Password'
    if (password !== confirmPassword)
      return ErrorResponse(
        { message: 'Password and Confirm Password Must be Same!!' },
        400,
        res
      );

    // Checking if a User already exist with the same email
    let user = await global.DB.User.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });
    if (user)
      return ErrorResponse(
        { message: 'User already exist with this email!!' },
        400,
        res
      );

    // Hashing the Password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Generating a OTP
    const OTP = Math.floor(100000 + Math.random() * 900000);

    // Create a New User
    user = await global.DB.User.create({
      full_name: full_name,
      email,
      password: hashedPassword,
      OTP,
      isEmailVerified: false,
    });

    // Create JWT
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET_KEY || 'TheSecretKey',
      { expiresIn: process.env.JWT_EXP_TIME || '24h' }
    );

    // Send Mail
    sendEmail({
      from: process.env.MY_EMAIL,
      to: email,
      subject: 'Email Verification',
      text: `Verify your Email Using OTP: ${OTP}`,
    });

    return res.status(201).json({
      success: true,
      message: 'User Sign Up Successfully!!',
      response: { token },
    });
  });

  // Login Post API
  static signin = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Check if a User Exist with the email
    const user = await global.DB.User.findOne({
      where: { email: email },
    });
    if (!user)
      return ErrorResponse(
        { message: 'No User Exist with given Email Address!!' },
        400,
        res
      );

    // Compare 'Password' and 'Hashed Password'
    if (!bcrypt.compareSync(password, user.password))
      return ErrorResponse({ message: 'Incorrect Password!!' }, 400, res);

    // Creating a JWT
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET_KEY || 'TheSecretKey',
      { expiresIn: process.env.JWT_EXP_TIME || '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login Successfully!!',
      response: {
        token,
        isEmailVerified: user.isEmailVerified,
        user_name: user.user_name,
      },
    });
  });

  // Send OTP API
  static sendOTP = catchAsync(async (req, res, next) => {
    // Fetched from the JWT in middleware
    const { email, isEmailVerified, OTP } = req.user;

    // Send Mail
    if (!isEmailVerified)
      // Send Mail
      sendEmail({
        from: process.env.MY_EMAIL,
        to: email,
        subject: 'Email Verification',
        text: `Verify your Email Using OTP: ${OTP}`,
      });

    res.status(200).send({
      success: true,
      message: 'Otp Sent Successfully!!',
    });
  });

  // Verify OTP API
  static verifyOTP = catchAsync(async (req, res, next) => {
    const { otpEntered } = req.body;

    // Fetched from the JWT in middleware
    const user = req.user;

    // Basic Non Empty Validation
    if (!otpEntered)
      return ErrorResponse({ message: 'Otp is Required!!' }, 400, res);

    // Compare 'User Entered Otp' and 'Database Otp'
    if (user.OTP != otpEntered)
      return res.status(200).send({
        status: 'fail',
        message: 'OTP does not Match!!',
      });

    // Update User
    await user.update({ isEmailVerified: true });
    await user.reload();

    res.status(200).send({
      success: true,
      message: 'Email Successfully Verified!!',
      response: { user },
    });
  });

  // Check Login API
  static checkLogin = catchAsync(async (req, res, next) => {
    const { id, user_name, isEmailVerified, email } = req.user;

    res.status(200).send({
      success: true,
      message: 'Authorized!!',
      response: {
        isEmailVerified,
        email,
        user_name,
      },
    });
  });

  // Set UserName
  static updateUserName = catchAsync(async (req, res, next) => {
    const { userName } = req.body;

    // Fetch User Data from JWT
    const { id: req_user_id } = req.user;

    // Basic Non Empty Validation
    if (!userName)
      return ErrorResponse({ message: 'UserName is Required' }, 400, res);

    // Check if User Name is not already in use
    const checkUserName = await global.DB.User.findOne({
      where: {
        user_name: userName,
        id: { [Op.ne]: req_user_id },
      },
      attributes: ['id'],
    });
    if (checkUserName)
      return ErrorResponse(
        { message: 'This UserName is already taken. Try different UserName.' },
        400,
        res
      );

    // Update UserName
    await global.DB.User.update(
      { user_name: userName },
      { where: { id: req_user_id } }
    );

    res.status(200).send({
      success: true,
      message: 'User Name Updated Successfully',
    });
  });

  // Update User Email Address
  static updateEmail = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    // Fetched User from JWT
    const { id } = req.user;

    // Basic Non Empty Validation
    if (!email)
      return ErrorResponse({ message: 'Email is Required!!' }, 400, res);

    // Check if Email is not already in Use
    const checkEmail = await global.DB.User.findOne({
      where: { email, id: { [Op.ne]: id } },
    });
    if (checkEmail) {
      return ErrorResponse(
        { message: 'Email Address already in Use!!' },
        400,
        res
      );
    }

    // Update Email Address
    await global.DB.User.update({ email }, { where: { id } });

    res.status(200).send({
      success: true,
      message: 'Email Successfully Updated!!',
    });
  });

  // Middleware for User Authentication from JWT
  static jwtVerify = catchAsync(async (req, res, next) => {
    let token = null;

    // Checking if token is Provided in the Headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    )
      token = req.headers.authorization.split(' ')[1];

    // If no Token then throw Error
    if (!token)
      return res.status(401).send({
        status: 'fail',
        tokenError: true,
        code: 200,
        message: 'Unauthenticated, no token found',
      });

    try {
      // Decode the token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET_KEY || 'TheSecretKey'
      );
      const { id } = decoded;

      // Find if User Exists
      const user = await global.DB.User.findOne({
        where: { id },
        attributes: [
          'id',
          'full_name',
          'user_name',
          'email',
          'OTP',
          'isEmailVerified',
        ],
      });

      // If no User Then Throw Error
      if (!user)
        return ErrorResponse(
          { message: 'No User Found!!', tokenError: true },
          401,
          res
        );

      // Set User in 'req' to access it in the next controller
      req.user = user;
      next();
    } catch (error) {
      // Error in Decoding Token
      console.log(error);

      // Throw ErrorResponse
      return ErrorResponse(
        { message: 'Invalid Token Provided!!', tokenError: true },
        401,
        res
      );
    }
  });
}

export default authController;
