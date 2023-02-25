import { Model, DataTypes } from 'sequelize';

class Post extends Model {
  static associate(models) {
    this.hasMany(models.PostLike, {
      sourceKey: 'id',
      foreignKey: 'post_id',
      as: 'post_likes',
    });
    this.hasMany(models.PostComment, {
      sourceKey: 'id',
      foreignKey: 'post_id',
      as: 'post_comments',
    });
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user_data',
    });
  }
}

const InitModel = (connection) => {
  Post.init(
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
      content: {
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
      modelName: 'Post',
      tableName: 'posts',
    }
  );

  console.log('Post Model Running');

  // await Post.sync({ alter: true });
  return Post;
};

export default InitModel;
