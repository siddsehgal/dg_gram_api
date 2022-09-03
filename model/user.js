import { Model } from 'sequelize';

class User extends Model {}

const model = (sequelize, DataTypes) => {
    User.init(
        {
            // Model attributes are defined here
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            user_name: {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            phoneNumber: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            OTP: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            isEmailVerified: {
                type: DataTypes.ENUM('0', '1'),
                allowNull: false,
                defaultValue: '0',
            },
            lastLoginAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            createdAt: { type: DataTypes.DATE, field: 'created_at' },
            updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
        },
        {
            timestamps: true,
            sequelize,
            modelName: 'User',
            tableName: 'users',
        }
    );
    return User;
};

export default model;
