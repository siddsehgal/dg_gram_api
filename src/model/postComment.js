import { Model, DataTypes } from 'sequelize';

class PostComment extends Model {}
const InitModel = (connection) => {
  PostComment.init(
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
      comment: {
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
      modelName: 'PostComment',
      tableName: 'post_comments',
    }
  );

  return PostComment;
};
export { PostComment as PostCommentModelType };
export default InitModel;
