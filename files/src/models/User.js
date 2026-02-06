const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // Core Identity
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM('super_admin', 'admin', 'employee'),
        defaultValue: 'employee'
    },
    // Employee Specifics
    employeeId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    department: {
        type: DataTypes.STRING
    },
    position: {
        type: DataTypes.STRING
    },
    salary: {
        type: DataTypes.DECIMAL(10, 2)
    },
    // Hardware Mapping
    cardNumber: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
});

module.exports = User;
