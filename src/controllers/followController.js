import jwt from 'jsonwebtoken';
import axios from 'axios';
import { Op } from 'sequelize';
import catchAsync from '../utils/catchAsync.js';

class followController {
    // Follow a User
    static follow = catchAsync(async (req, res, next) => {
        const { userId } = req.params;
        const user = req.user;

        const isAlreadyFollowed = await global.DB.Follower.findOne({
            where: {
                user_id: userId,
                follower_id: user.id,
            },
        });

        if (isAlreadyFollowed)
            return res.status(200).send({
                message: 'Already Follwing',
                status: 'fail',
            });

        const follow = await global.DB.Follower.create({
            user_id: userId,
            follower_id: user.id,
            status: '1',
        });

        res.send({
            status: 'success',
            message: 'User Folllowed Successfully',
            follow,
        });
    });

    // Unfollow a User
    static unFollow = catchAsync(async (req, res, next) => {
        const { userId } = req.params;
        const user = req.user;

        const isAlreadyFollowed = await global.DB.Follower.findOne({
            where: {
                user_id: userId,
                follower_id: user.id,
            },
        });

        if (!isAlreadyFollowed)
            return res.status(200).send({
                message: 'Not already Following',
                status: 'fail',
            });

        await isAlreadyFollowed.destroy();

        res.send({
            status: 'success',
            message: 'UnFolllowed Successfully',
        });
    });

    // Get Following Users List
    static followingUsers = catchAsync(async (req, res, next) => {
        const followingUsers = await global.DB.Follower.findAll({
            where: {
                follower_id: req.user.id,
                status: '1',
            },
            attributes: ['id', 'user_id', 'status'],
            include: [
                {
                    model: global.DB.User,
                    as: 'user',
                    attributes: ['id', 'name', 'user_name'],
                },
            ],
        });

        res.send({
            status: 'success',
            message: 'UnFolllowed Successfully',
            followingUsers,
        });
    });
}

export default followController;
