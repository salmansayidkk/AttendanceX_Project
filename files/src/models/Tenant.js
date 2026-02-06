const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tenant = sequelize.define('Tenant', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: { // Admin Contact Email
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    plan: {
        type: DataTypes.ENUM('Free', 'Pro', 'Enterprise'),
        defaultValue: 'Free'
    },
    status: {
        type: DataTypes.ENUM('Active', 'Suspended'),
        defaultValue: 'Active'
    }
});

module.exports = Tenant;
