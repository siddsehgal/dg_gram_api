import { DataTypes, Model } from 'sequelize';

class Chat extends Model {
  static associate(models) {
    this.belongsTo(models.UsersRoom, {
      as: 'room_data',
      foreignKey: 'room_id',
      targetKey: 'id',
    });
  }
}
const InitModel = (connection) => {
  Chat.init(
    {
      // Model attributes are defined here
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      room_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      from: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      message: {
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
      modelName: 'Chat',
      tableName: 'chats',
    }
  );

  return Chat;
};

export default InitModel;
