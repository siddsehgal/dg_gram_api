import { Model, DataTypes } from 'sequelize';

class PostLike extends Model {}
const InitModel = (connection) => {
  PostLike.init(
    {
      // Model attributes are defined here
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      post_id: {
        type: DataTypes.INTEGER,
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
      modelName: 'PostLike',
      tableName: 'post_likes',
    }
  );
  console.log('PostLike Model Running');

  // await PostLike.sync({ alter: true });
  return PostLike;
};

export default InitModel;
