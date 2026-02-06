const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Shift = sequelize.define('Shift', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    endTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    lateTolerance: {
        type: DataTypes.INTEGER, // in minutes
        defaultValue: 15
    }
});

module.exports = Shift;
