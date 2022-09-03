import { Sequelize, DataTypes } from 'sequelize';
import User from './user.js';
import Follower from './follower.js';
// import Roles from './roles';
// import UserRoles from './userRoles';

const DB = async () => {
    const sequelize = new Sequelize(
        process.env.MYSQL_DB,
        process.env.MYSQL_USER,
        process.env.MYSQL_PASSWORD,
        {
            host: process.env.MYSQL_HOST,
            dialect: 'mysql',
            logging: false,
            dialectOptions: {
                // useUTC: false,
                dateStrings: true,
                typeCast: true,
            },
            timezone: '+05:30',
        }
    );

    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully (MySql).');

        const db = {
            sequelize: sequelize,
            User: User(sequelize, DataTypes),
            Follower: Follower(sequelize, DataTypes),
        };

        Object.keys(db).forEach((modelName) => {
            if (db[modelName].associate) {
                db[modelName].associate(db);
            }
        });

        // // ------ DANGER TO UNCOMMENT ------
        // await sequelize.sync({ force: true });

        global.DB = db;
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

export default DB;
