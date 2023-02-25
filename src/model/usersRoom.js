import { Model, DataTypes } from 'sequelize';

class UsersRoom extends Model {}
const InitModel = (connection) => {
  UsersRoom.init(
    {
      // Model attributes are defined here
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      users: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      createdAt: { type: DataTypes.DATE, field: 'created_at' },
      updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    },
    {
      timestamps: true,
      sequelize: connection,
      modelName: 'UsersRoom',
      tableName: 'users_rooms',
    }
  );
  console.log('UsersRoom Model Running');

  // await UsersRoom.sync({ alter: true });
  return UsersRoom;
};
// export { UsersRoom as UsersRoomType };
export default InitModel;
