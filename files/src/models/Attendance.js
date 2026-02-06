const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Device = require('./Device');

const Attendance = sequelize.define('Attendance', {
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('CheckIn', 'CheckOut', 'BreakOut', 'BreakIn', 'OvertimeIn', 'OvertimeOut'),
        defaultValue: 'CheckIn'
    },
    // Raw status from device (0, 1, 4, 5 etc) if needed
    type: {
        type: DataTypes.INTEGER
    }
});

// Associations will be defined in index.js or here
// Attendance.belongsTo(User);
// Attendance.belongsTo(Device);

module.exports = Attendance;
