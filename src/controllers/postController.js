import { Op } from 'sequelize';
import catchAsync from '../utils/catchAsync.js';
import ErrorResponse from '../utils/errorResponse.js';

class postController {
  // Get Post API
  static getPosts = catchAsync(async (req, res, next) => {
    // Fetch User from JWT
    const user = req.user;

    // Destructure Properties from Request Query
    const { post_id, user_id, following } = req.query;

    // Get User Ids of User I am following
    // Only if 'following' is true
    const followedUsersIds =
      following == 'true'
        ? (
            await global.DB.Follower.findAll({
              where: { follower_id: user.id },
              attributes: ['id', 'user_id'],
            })
          ).map((item) => item.user_id)
        : [];

    // Fetch Posts from Database
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

    // Insert Likes Count and Is this Self Post in the Response
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

  // Create New Post API
  static createPosts = catchAsync(async (req, res, next) => {
    // Fetched User from JWT
    const user = req.user;

    // Post Content from Request Body
    const { content } = req.body;

    // Initialize Post object
    const postObj = {
      user_id: user.id,
      content,
    };

    // Create Post in the database
    const post = await global.DB.Post.create(postObj);

    res.status(201).json({
      success: true,
      message: 'Post Created Successfully',
      response: { post },
    });
  });

  // Delete a Post API
  static deletePosts = catchAsync(async (req, res, next) => {
    // Fetched User form JWT
    const user = req.user;

    // Post Id to delete from Request Query
    const { post_id } = req.query;

    // Check if Post belongs to the Same User
    const post = await global.DB.Post.findOne({
      where: {
        id: post_id,
        user_id: user.id,
      },
    });

    // If Post doesn't belong to the same User then throw Error
    if (!post) return ErrorResponse({ message: 'Post not Found' }, 400, res);

    // Delete Post from the Database
    await post.destroy();

    res.send({
      success: true,
      message: 'Post Deleted Successfully',
    });
  });

  // Like a Post API
  static createPostLike = catchAsync(async (req, res, next) => {
    // Fetched User form JWT
    const user = req.user;

    // Post Id to Like from Request Query
    const { post_id } = req.query;

    // Basic Non Empty Validation
    if (!Number(post_id))
      return ErrorResponse({ message: 'post_id is Required!!' }, 400, res);

    // Check if Post Exists
    const post = await global.DB.Post.findOne({ where: { id: post_id } });

    // If Post not Exists then Throw Error
    if (!post) return ErrorResponse({ message: 'No post found!!' }, 404, res);

    // Initialize Post Like Object
    const postLikeObj = {
      user_id: user.id,
      post_id: Number(post_id),
    };

    // Create Post Like Entry in the Database
    const postLike = await global.DB.PostLike.create(postLikeObj);

    res.status(201).json({
      success: true,
      message: 'Post Liked Successfully',
      response: { postLike },
    });
  });

  // Remove Like from a Post API
  static deletePostLike = catchAsync(async (req, res, next) => {
    // Fetched User from JWT
    const user = req.user;
    // Post Id to Remove Like from Request Query
    const { post_id } = req.query;

    // Basic Non Empty Validation
    if (!Number(post_id))
      return ErrorResponse({ message: 'post_id is Required!!' }, 400, res);

    // Check If Post Exists in the Database
    const post = await global.DB.Post.findOne({ where: { id: post_id } });

    // If not then Throw Error
    if (!post) return ErrorResponse({ message: 'No post found!!' }, 404, res);

    // Delete Post Like from Database
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
