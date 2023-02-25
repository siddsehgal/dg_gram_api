import jwt from 'jsonwebtoken';
import axios from 'axios';
import bcrypt from 'bcrypt';
import { sendEmail } from '../utils/sendEmail.js';
import { Op } from 'sequelize';
import catchAsync from '../utils/catchAsync.js';
import ErrorResponse from '../utils/errorResponse.js';

class authController {
  //SingUp Post API
  static signup = catchAsync(async (req, res, next) => {
    const { full_name, email, password, confirmPassword } = req.body;

    if (!full_name || !email || !password || !confirmPassword)
      return ErrorResponse({ message: 'All Fields are Required!!' }, 400, res);

    if (password !== confirmPassword)
      return ErrorResponse(
        { message: 'Password and Confirm Password Must be Same!!' },
        400,
        res
      );

    const hashedPassword = bcrypt.hashSync(password, 10);

    let user = await global.DB.User.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });

    const OTP = Math.floor(100000 + Math.random() * 900000);

    if (user)
      return ErrorResponse(
        { message: 'User already exist with this email!!' },
        400,
        res
      );

    user = await global.DB.User.create({
      full_name: full_name,
      email,
      password: hashedPassword,
      OTP,
      isEmailVerified: false,
    });

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
  static login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await global.DB.User.findOne({
      where: { email: email },
    });

    if (!user)
      return ErrorResponse(
        { message: 'No User Exist with given Email Address!!' },
        400,
        res
      );

    if (!bcrypt.compareSync(password, user.password))
      return ErrorResponse({ message: 'Incorrect Password!!' }, 400, res);

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

  // Resend OTP
  static sendOTP = catchAsync(async (req, res, next) => {
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

  // Verify OTP
  static verifyOTP = catchAsync(async (req, res, next) => {
    const { id, OTP } = req.user;
    const user = req.user;
    const { otpEntered } = req.body;

    if (!otpEntered)
      return ErrorResponse({ message: 'Otp is Required!!' }, 400, res);

    if (OTP != otpEntered)
      return res.status(200).send({
        status: 'fail',
        message: 'OTP does not Match!!',
      });

    await user.update({ isEmailVerified: true });
    await user.reload();

    res.status(200).send({
      success: true,
      message: 'Email Successfully Verified!!',
      response: { user },
    });
  });

  // Check Login
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
  static setUserName = catchAsync(async (req, res, next) => {
    const { id: req_user_id } = req.user;
    const { userName } = req.body;

    if (!userName)
      return ErrorResponse({ message: 'UserName is Required' }, 400, res);

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

    await global.DB.User.update(
      { user_name: userName },
      { where: { id: req_user_id } }
    );

    res.status(200).send({
      success: true,
      message: 'User Name Updated Successfully',
    });
  });

  static updateEmail = catchAsync(async (req, res, next) => {
    const { id } = req.user;
    const { email } = req.body;

    if (!email)
      return ErrorResponse({ message: 'Email is Required!!' }, 400, res);

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

    await global.DB.User.update({ email }, { where: { id } });

    res.status(200).send({
      success: true,
      message: 'Email Successfully Updated!!',
    });
  });
  // JWT Verify

  static jwtVerify = catchAsync(async (req, res, next) => {
    let token = null;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    )
      token = req.headers.authorization.split(' ')[1];

    if (!token)
      return res.status(401).send({
        status: 'fail',
        tokenError: true,
        code: 200,
        message: 'Unauthenticated, no token found',
      });

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET_KEY || 'TheSecretKey'
      );
      const { id } = decoded;

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

      if (!user)
        return ErrorResponse(
          { message: 'No User Found!!', tokenError: true },
          401,
          res
        );

      // console.log(req);

      req.user = user;
      next();
    } catch (error) {
      console.log(error);

      return ErrorResponse(
        { message: 'Invalid Token Provided!!', tokenError: true },
        401,
        res
      );
    }
  });

  // // Get Google SignIn Link
  // static getGoogleLoginLink = async (req, res) => {
  //   const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  //   const options = {
  //     redirect_uri: `${process.env.ROOT_URL}${process.env.GOOGLE_REDIRECT_URI}`,
  //     client_id: process.env.GOOGLE_CLIENT_ID,
  //     access_type: 'offline',
  //     response_type: 'code',
  //     prompt: 'consent',
  //     scope: [
  //       'https://www.googleapis.com/auth/userinfo.profile',
  //       'https://www.googleapis.com/auth/userinfo.email',
  //     ].join(' '),
  //   };
  //   const googleAuthURL = `${rootUrl}?${new URLSearchParams(
  //     options
  //   ).toString()}`;

  //   return res.send(googleAuthURL);
  // };

  // // Verify Google SignIn
  // static googleLoginVerify = async (req, res) => {
  //   const code = req.query.code;

  //   const queryOption = {
  //     code,
  //     client_id: process.env.GOOGLE_CLIENT_ID,
  //     client_secret: process.env.GOOGLE_CLIENT_SECRET,
  //     redirect_uri: `${process.env.ROOT_URL}${process.env.GOOGLE_REDIRECT_URI}`,
  //     grant_type: 'authorization_code',
  //   };

  //   let tokenReqOptions = {
  //     url: `https://oauth2.googleapis.com/token?${new URLSearchParams(
  //       queryOption
  //     ).toString()}`,
  //     method: 'POST',
  //   };

  //   let tokens = await axios.request(tokenReqOptions).catch((error) => {
  //     return { isError: true, error: error.response.data };
  //   });

  //   if (tokens.isError)
  //     return res.status(200).send({
  //       message: `Failed to fetch auth tokens`,
  //       error: tokens.error,
  //     });

  //   const { id_token, access_token } = tokens.data;

  //   let userReqOptions = {
  //     url: `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&${new URLSearchParams(
  //       {
  //         access_token,
  //       }
  //     ).toString()}`,
  //     method: 'GET',
  //     headers: {
  //       Authorization: `Bearer ${id_token}`,
  //     },
  //   };

  //   let googleUser = await axios.request(userReqOptions).catch((error) => {
  //     return { isError: true, error: error.response.data };
  //   });

  //   if (googleUser.isError)
  //     return res.status(200).send({
  //       message: `Failed to fetch user`,
  //       error: googleUser.error,
  //     });

  //   const { email, name } = googleUser.data;

  //   let user = await global.DB.User.findOne({ email: email.toLowerCase() });

  //   if (!user) {
  //     const newUser = new global.DB.User({
  //       userName: name,
  //       email: email,
  //     });

  //     user = await newUser.save();
  //   }

  //   const token = jwt.sign(
  //     { id: user._id },
  //     process.env.JWT_SECRET_KEY || 'TheSecretKey',
  //     { expiresIn: process.env.JWT_EXP_TIME || '24h' }
  //   );

  //   res.status(200).send({ message: 'Login Successfully', token, user });
  // };

  // // Get Facebook SignIn Link
  // static getFacebookLoginLink = async (req, res) => {
  //   const rootUrl = 'https://www.facebook.com/v14.0/dialog/oauth';
  //   const options = {
  //     redirect_uri: `${process.env.ROOT_URL}${process.env.FACEBOOK_REDIRECT_URI}`,
  //     client_id: process.env.FACEBOOK_CLIENT_ID,
  //   };
  //   const facebookAuthURL = `${rootUrl}?${new URLSearchParams(
  //     options
  //   ).toString()}`;

  //   return res.send({ options, facebookAuthURL });
  // };

  // // Verify Facebook SignIn
  // static facebookLoginVerify = async (req, res) => {
  //   const code = req.query.code;

  //   let queryOption = {
  //     client_id: process.env.FACEBOOK_CLIENT_ID,
  //     redirect_uri: `${process.env.ROOT_URL}${process.env.FACEBOOK_REDIRECT_URI}`,
  //     client_secret: process.env.FACEBOOK_CLIENT_SECRET,
  //     code,
  //   };
  //   let tokenReqOptions = {
  //     url: `https://graph.facebook.com/v14.0/oauth/access_token?${new URLSearchParams(
  //       queryOption
  //     ).toString()}`,
  //     method: 'GET',
  //   };

  //   let tokenRes = await axios.request(tokenReqOptions).catch((error) => {
  //     return { isError: true, error: error.response.data };
  //   });

  //   if (tokenRes.isError) return res.status(200).send({ data: tokenRes.error });

  //   const { access_token } = tokenRes.data;

  //   let userDataQueryOptions = {
  //     fields: 'email,name',
  //     access_token,
  //   };

  //   let userDataReqOptions = {
  //     url: `https://graph.facebook.com/me?${new URLSearchParams(
  //       userDataQueryOptions
  //     ).toString()}`,
  //     method: 'GET',
  //   };

  //   let userData = await axios.request(userDataReqOptions).catch((error) => {
  //     return { isError: true, error: error.response.data };
  //   });

  //   if (userData.isError) return res.status(200).send({ data: userData.error });

  //   const { email, name, id } = userData.data;

  //   let user = await global.DB.User.findOne({ email: email.toLowerCase() });

  //   if (!user) {
  //     const newUser = new global.DB.User({
  //       userName: name,
  //       email: email,
  //     });

  //     user = await newUser.save();
  //   }

  //   const token = jwt.sign(
  //     { id: user._id },
  //     process.env.JWT_SECRET_KEY || 'TheSecretKey',
  //     { expiresIn: process.env.JWT_EXP_TIME || '24h' }
  //   );

  //   res.status(200).send({ message: 'Login Successfully', token, user });
  // };
}

export default authController;
