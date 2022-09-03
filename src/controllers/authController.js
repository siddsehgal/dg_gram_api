import jwt from 'jsonwebtoken';
import axios from 'axios';
import bcrypt from 'bcrypt';
import { sendEmail } from '../utils/sendEmail.js';
import { Op } from 'sequelize';

class authController {
    //Singup Post API
    static signup = async (req, res, next) => {
        try {
            const { name, email, phoneNumber } = req.body;

            if (
                !name ||
                !email ||
                !req.body.password ||
                !req.body.confirmPassword
            )
                return res.status(200).send({
                    status: 'fail',
                    message: 'All Fields are Required!!',
                });

            if (req.body.password !== req.body.confirmPassword)
                return res.status(200).send({
                    status: 'fail',
                    message: 'Password and Confirm Password Must be Same!!',
                });

            const password = bcrypt.hashSync(req.body.password, 10);

            let user = await global.DB.User.findOne({
                where: {
                    email: email.toLowerCase(),
                },
            });

            const OTP = Math.floor(100000 + Math.random() * 900000);

            if (user)
                return res.status(200).send({
                    status: 'fail',
                    message: 'User already exist with this email!!',
                });

            user = await global.DB.User.create({
                name,
                email,
                password,
                OTP,
                isEmailVerified: '0',
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

            res.send({
                status: 'success',
                message: 'User Sign Up Successfully!!',
                token,
                user,
            });
        } catch (error) {
            console.log(error);
        }
    };

    // Login Post API
    static login = async (req, res, next) => {
        try {
            const { email, password } = req.body;

            const user = await global.DB.User.findOne({
                where: { email: email },
            });

            if (!user)
                return res.status(200).send({
                    status: 'fail',
                    message: 'No User Exist with given Email Address!!',
                });

            if (!bcrypt.compareSync(password, user.password))
                return res.status(200).send({
                    status: 'fail',
                    message: 'Incorrect Password!!',
                });

            const token = jwt.sign(
                { id: user.id },
                process.env.JWT_SECRET_KEY || 'TheSecretKey',
                { expiresIn: process.env.JWT_EXP_TIME || '24h' }
            );

            res.send({
                status: 'success',
                message: 'Login Successfully!!',
                token,
                user,
            });
        } catch (error) {
            console.log(error);
            res.status(200).send({
                status: 'fail',
                message: 'Something Went Wrong',
                error,
            });
        }
    };

    // Resend OTP
    static sendOTP = async (req, res, next) => {
        const { email, isEmailVerified, OTP } = req.user;

        // Send Mail

        if (isEmailVerified === '0')
            sendEmail({
                from: process.env.MY_EMAIL,
                to: email,
                subject: 'Email Verification',
                text: `Verify your Email Using OTP: ${OTP}`,
            });

        res.status(200).send({
            isEmailVerified: isEmailVerified,
            status: 'success',
            message: 'Otp Send',
        });
    };

    // Verify OTP
    static verifyOTP = async (req, res, next) => {
        const { id, OTP } = req.user;
        const { otpEntered } = req.body;

        // if (!OtpEntered)
        //     return res.status(200).send({
        //         status: 'fail',
        //         message: 'OTP is Required!!',
        //     });

        if (OTP != otpEntered)
            return res.status(200).send({
                status: 'fail',
                message: 'OTP does not Match!!',
            });

        const user = await global.DB.User.findOne({
            where: { id },
        });
        await user.update({ isEmailVerified: '1' });

        res.status(200).send({
            status: 'success',
            message: 'Email Successfully Verified!!',
        });
    };

    // Check Login
    static checkLogin = async (req, res, next) => {
        const { id, isEmailVerified } = req.user;

        res.status(200).send({
            isEmailVerified,
            status: 'success',
            message: 'Token Verified',
        });
    };

    // Set UserName

    static setUserName = async (req, res, next) => {
        const { userName } = req.body;

        if (!userName)
            return res.status(200).send({
                status: 'fail',
                message: 'UserName is Required',
            });

        const checkUserName = await global.DB.User.findOne({
            where: {
                user_name: userName,
                id: { [Op.ne]: req.user.id },
            },
            attributes: ['id'],
        });

        if (checkUserName)
            return res.status(200).send({
                status: 'fail',
                message:
                    'This UserName is already taken. Try different UserName.',
            });

        await req.user.update({ user_name: userName });

        res.status(200).send({
            status: 'success',
            message: 'SignUp Successfully',
            user: req.user,
        });
    };

    // JWT Verify

    static jwtVerify = async (req, res, next) => {
        let token = null;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        )
            token = req.headers.authorization.split(' ')[1];

        if (!token)
            return res.status(200).send({
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
                attributes: ['id', 'name', 'email', 'OTP', 'isEmailVerified'],
            });

            if (!user)
                return res.status(200).send({
                    status: 'fail',
                    tokenError: true,
                    code: 200,
                    message: 'No User Found!!',
                });

            req.user = user;
            next();
        } catch (error) {
            return res.status(200).send({
                status: 'fail',
                tokenError: true,
                code: 200,
                message: 'Invalid Token Provided!!',
                error,
            });
        }
    };

    // Get Google SignIn Link
    static getGoogleLoginLink = async (req, res) => {
        const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
        const options = {
            redirect_uri: `${process.env.ROOT_URL}${process.env.GOOGLE_REDIRECT_URI}`,
            client_id: process.env.GOOGLE_CLIENT_ID,
            access_type: 'offline',
            response_type: 'code',
            prompt: 'consent',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email',
            ].join(' '),
        };
        const googleAuthURL = `${rootUrl}?${new URLSearchParams(
            options
        ).toString()}`;

        return res.send(googleAuthURL);
    };

    // Verify Google SignIn
    static googleLoginVerify = async (req, res) => {
        const code = req.query.code;

        const queryOption = {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: `${process.env.ROOT_URL}${process.env.GOOGLE_REDIRECT_URI}`,
            grant_type: 'authorization_code',
        };

        let tokenReqOptions = {
            url: `https://oauth2.googleapis.com/token?${new URLSearchParams(
                queryOption
            ).toString()}`,
            method: 'POST',
        };

        let tokens = await axios.request(tokenReqOptions).catch((error) => {
            return { isError: true, error: error.response.data };
        });

        if (tokens.isError)
            return res.status(200).send({
                message: `Failed to fetch auth tokens`,
                error: tokens.error,
            });

        const { id_token, access_token } = tokens.data;

        let userReqOptions = {
            url: `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&${new URLSearchParams(
                {
                    access_token,
                }
            ).toString()}`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${id_token}`,
            },
        };

        let googleUser = await axios.request(userReqOptions).catch((error) => {
            return { isError: true, error: error.response.data };
        });

        if (googleUser.isError)
            return res.status(200).send({
                message: `Failed to fetch user`,
                error: googleUser.error,
            });

        const { email, name } = googleUser.data;

        let user = await global.DB.User.findOne({ email: email.toLowerCase() });

        if (!user) {
            const newUser = new global.DB.User({
                userName: name,
                email: email,
            });

            user = await newUser.save();
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET_KEY || 'TheSecretKey',
            { expiresIn: process.env.JWT_EXP_TIME || '24h' }
        );

        res.status(200).send({ message: 'Login Successfully', token, user });
    };

    // Get Facebook SignIn Link
    static getFacebookLoginLink = async (req, res) => {
        const rootUrl = 'https://www.facebook.com/v14.0/dialog/oauth';
        const options = {
            redirect_uri: `${process.env.ROOT_URL}${process.env.FACEBOOK_REDIRECT_URI}`,
            client_id: process.env.FACEBOOK_CLIENT_ID,
        };
        const facebookAuthURL = `${rootUrl}?${new URLSearchParams(
            options
        ).toString()}`;

        return res.send({ options, facebookAuthURL });
    };

    // Verify Facebook SignIn
    static facebookLoginVerify = async (req, res) => {
        const code = req.query.code;

        let queryOption = {
            client_id: process.env.FACEBOOK_CLIENT_ID,
            redirect_uri: `${process.env.ROOT_URL}${process.env.FACEBOOK_REDIRECT_URI}`,
            client_secret: process.env.FACEBOOK_CLIENT_SECRET,
            code,
        };
        let tokenReqOptions = {
            url: `https://graph.facebook.com/v14.0/oauth/access_token?${new URLSearchParams(
                queryOption
            ).toString()}`,
            method: 'GET',
        };

        let tokenRes = await axios.request(tokenReqOptions).catch((error) => {
            return { isError: true, error: error.response.data };
        });

        if (tokenRes.isError)
            return res.status(200).send({ data: tokenRes.error });

        const { access_token } = tokenRes.data;

        let userDataQueryOptions = {
            fields: 'email,name',
            access_token,
        };

        let userDataReqOptions = {
            url: `https://graph.facebook.com/me?${new URLSearchParams(
                userDataQueryOptions
            ).toString()}`,
            method: 'GET',
        };

        let userData = await axios
            .request(userDataReqOptions)
            .catch((error) => {
                return { isError: true, error: error.response.data };
            });

        if (userData.isError)
            return res.status(200).send({ data: userData.error });

        const { email, name, id } = userData.data;

        let user = await global.DB.User.findOne({ email: email.toLowerCase() });

        if (!user) {
            const newUser = new global.DB.User({
                userName: name,
                email: email,
            });

            user = await newUser.save();
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET_KEY || 'TheSecretKey',
            { expiresIn: process.env.JWT_EXP_TIME || '24h' }
        );

        res.status(200).send({ message: 'Login Successfully', token, user });
    };
}

export default authController;
