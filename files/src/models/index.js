const sequelize = require('../config/database');
const User = require('./User');
const Device = require('./Device');
const Attendance = require('./Attendance');
const Leave = require('./Leave');
const Shift = require('./Shift');
const Tenant = require('./Tenant');

// --- Multi-Tenancy Associations ---
// Every major model belongs to a Tenant
Tenant.hasMany(User);
User.belongsTo(Tenant);

Tenant.hasMany(Device);
Device.belongsTo(Tenant);

Tenant.hasMany(Shift);
Shift.belongsTo(Tenant);

Tenant.hasMany(Attendance);
Attendance.belongsTo(Tenant);

// --- Standard Associations ---
User.hasMany(Attendance);
Attendance.belongsTo(User);

Device.hasMany(Attendance);
Attendance.belongsTo(Device);

User.hasMany(Leave);
Leave.belongsTo(User);

// Shift associations
Shift.hasMany(User);
User.belongsTo(Shift);

const initDB = async () => {
    try {
        // Force sync to update schema for SaaS (Wait, this wipes data!)
        await sequelize.sync({ force: false });
        console.log('Database synced successfully (SaaS Schema - Persistence Enabled)');

        // Create Super Admin Tenant if empty
        const count = await Tenant.count();
        if (count === 0) {
            console.log('Initializing Default Tenant...');
            // We will handle seeding in a separate step or just log it.
        }
    } catch (error) {
        console.error('Unable to sync database:', error);
    }
};

module.exports = {
    sequelize,
    initDB,
    User,
    Device,
    Attendance,
    Leave,
    Shift,
    Tenant
};
