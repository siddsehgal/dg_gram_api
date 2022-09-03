import { Model } from 'sequelize';

class Follower extends Model {
    static associate(model) {
        this.belongsTo(model.User, {
            as: 'user',
            foreignKey: 'user_id',
            targetKey: 'id',
        });
    }
}

const model = (sequelize, DataTypes) => {
    Follower.init(
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
            follower_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM('0', '1'),
                defaultValue: '1',
                allowNull: false,
            },
            createdAt: { type: DataTypes.DATE, field: 'created_at' },
            updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
        },
        {
            timestamps: true,
            sequelize,
            modelName: 'Follower',
            tableName: 'follower',
        }
    );
    return Follower;
};

export default model;
