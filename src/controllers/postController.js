import jwt from 'jsonwebtoken';
import axios from 'axios';
import { Op } from 'sequelize';
import catchAsync from '../utils/catchAsync.js';
import ErrorResponse from '../utils/ErrorResponse.js';

class postController {
  static getPosts = catchAsync(async (req, res, next) => {
    const user = req.user;
    const { post_id, user_id, following } = req.query;

    const followedUsersIds =
      following == 'true'
        ? (
            await global.DB.Follower.findAll({
              where: { follower_id: user.id },
              attributes: ['id', 'user_id'],
            })
          ).map((item) => item.user_id)
        : [];

    const posts = await global.DB.Post.findAll({
      where: {
        ...(post_id
          ? { id: post_id }
          : {
              user_id:
                following == 'true'
                  ? {
                      [Op.in]: [...followedUsersIds, user.id],
                    }
                  : user_id || user.id,
            }),
      },
      include: [
        {
          model: global.DB.PostLike,
          as: 'post_likes',
          // where: { user_id: user.id },
          required: false,
          attributes: ['id', 'user_id'],
        },
        {
          model: global.DB.User,
          as: 'user_data',
          attributes: ['id', 'user_name'],
        },
      ],
      order: [['createdAt', 'desc']],
    });

    // const post_like_count = await PostLike.count({ where: { post_id: post.id } });

    const postRes = posts.map((item) => {
      return {
        ...item.toJSON(),
        is_liked:
          item.post_likes.filter(
            (postLikeItem) => postLikeItem.user_id === user.id
          ).length > 0,
        is_self_post: item.user_id === user.id,
      };
    });

    res.status(200).json({
      success: true,
      message: 'Post Fetched Successfully',
      response: { posts: postRes },
    });
  });

  static createPosts = catchAsync(async (req, res, next) => {
    const user = req.user;
    const { content } = req.body;

    const postObj = {
      user_id: user.id,
      content,
    };

    const post = await global.DB.Post.create(postObj);

    res.status(201).json({
      success: true,
      message: 'Post Created Successfully',
      response: { post },
    });
  });
  static deletePosts = catchAsync(async (req, res, next) => {
    const user = req.user;
    const { post_id } = req.query;

    const post = await global.DB.Post.findOne({
      where: {
        id: post_id,
        user_id: user.id,
      },
    });

    if (!post) return ErrorResponse({ message: 'Post not Found' }, 400, res);

    await post.destroy();

    res.send({
      success: true,
      message: 'Post Deleted Successfully',
    });
  });

  static createPostLike = catchAsync(async (req, res, next) => {
    const user = req.user;
    const { post_id } = req.query;

    if (!Number(post_id))
      return ErrorResponse({ message: 'post_id is Required!!' }, 400, res);

    const post = await global.DB.Post.findOne({ where: { id: post_id } });

    if (!post) return ErrorResponse({ message: 'No post found!!' }, 404, res);

    const postLikeObj = {
      user_id: user.id,
      post_id: Number(post_id),
    };

    const postLike = await global.DB.PostLike.create(postLikeObj);

    res.status(201).json({
      success: true,
      message: 'Post Liked Successfully',
      response: { postLike },
    });
  });

  static deletePostLike = catchAsync(async (req, res, next) => {
    const user = req.user;
    const { post_id } = req.query;

    if (!Number(post_id))
      return ErrorResponse({ message: 'post_id is Required!!' }, 400, res);

    const post = await global.DB.Post.findOne({ where: { id: post_id } });

    if (!post) return ErrorResponse({ message: 'No post found!!' }, 404, res);

    const postLike = await global.DB.PostLike.destroy({
      where: { user_id: user.id, post_id },
    });

    res.status(201).json({
      success: true,
      message: 'Post Liked Removed Successfully',
      response: { postLike },
    });
  });
}

export default postController;
