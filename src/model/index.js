import { Sequelize } from 'sequelize';
//  Models
import User from './user.js';
import Follower from './follower.js';
import Post from './post.js';
import PostLike from './postLike.js';
import PostComment from './postComment.js';
import Chat from './chat.js';
import UsersRoom from './usersRoom.js';

const MySqlDB = async () => {
  try {
    // Connecting to database
    const sequelize = new Sequelize({
      database: process.env.MYSQL_DB,
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      host: process.env.MYSQL_HOST,
      dialect: 'mysql',
      logging: false,
      dialectOptions: {
        dateStrings: true,
        typeCast: true,
      },
      timezone: '+05:30',
    });

    // Testing new Connection
    await sequelize.authenticate();
    console.log('----Connected to MySQL Database Successfully----');

    const DB = {
      sequelize,
      User: User(sequelize),
      Follower: Follower(sequelize),
      Post: Post(sequelize),
      PostLike: PostLike(sequelize),
      PostComment: PostComment(sequelize),
      Chat: Chat(sequelize),
      UsersRoom: UsersRoom(sequelize),
    };

    // Setting the association of model
    Object.keys(DB).forEach((modelName) => {
      if (DB[modelName].associate) {
        DB[modelName].associate(DB);
      }
    });

    // --Sync the Database with Models--
    // await sequelize.sync({ force: true });

    global.DB = DB;
  } catch (error) {
    // Catching Connection Error
    console.log('MySqlDB Error: ', error);
    console.log('----Error in Connecting to MySQL----');
  }
};

export default MySqlDB;
