const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Device = sequelize.define('Device', {
    ip: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    port: {
        type: DataTypes.INTEGER,
        defaultValue: 4370
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.ENUM('online', 'offline'),
        defaultValue: 'offline'
    },
    lastSync: {
        type: DataTypes.DATE
    }
});

module.exports = Device;
