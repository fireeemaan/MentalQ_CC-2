const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Users = require('./users');

const UserSessions = sequelize.define('user_sessions', {
    session_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    session_token: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});

UserSessions.belongsTo(Users,{ as: 'users' , foreignKey: 'user_id' })

module.exports = UserSessions;