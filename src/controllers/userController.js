import { Op } from 'sequelize';
import catchAsync from '../utils/catchAsync.js';

class authController {
    //Singup Post API
    static getUserData = catchAsync(async (req, res, next) => {
        const { id } = req.query;
        const self = !id || id == req.user.id ? true : false;
        let isFollowed;

        const user = await global.DB.User.findOne({
            where: {
                id: id ? id : req.user.id,
            },
            attributes: ['id', 'name', 'email', 'user_name'],
        });

        if (!user)
            return res.status(200).send({
                status: 'fail',
                message: 'User not Found!!',
            });

        console.log(self);
        if (!self)
            isFollowed = await global.DB.Follower.findOne({
                where: {
                    user_id: id,
                    follower_id: req.user.id,
                },
            });

        res.status(200).send({
            status: 'success',
            message: 'User data fetched Successfully!!',
            user,
            self,
            isFollowed: isFollowed ? true : false,
        });
    });

    static getUsersByUserName = catchAsync(async (req, res, next) => {
        const { userName } = req.query;

        const users = await global.DB.User.findAll({
            where: {
                user_name: { [Op.like]: `%${userName}%` },
            },
            attributes: ['id', 'name', 'user_name', 'email'],
        });

        res.status(200).send({
            status: 'success',
            message: 'User data fetched Successfully!!',
            users,
        });
    });
}

export default authController;
