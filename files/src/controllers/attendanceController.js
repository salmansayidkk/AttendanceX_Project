const { Attendance, User } = require('../models');
const { Op } = require('sequelize');

exports.getStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalEmployees = await User.count({
            where: { status: 'active', TenantId: req.user.TenantId }
        });

        const presentToday = await Attendance.count({
            where: {
                timestamp: {
                    [Op.gte]: today
                },
                status: { [Op.in]: ['CheckIn', 'Present', 'Late'] },
                TenantId: req.user.TenantId
            },
            distinct: true,
            col: 'UserId'
        });

        // Logic for Late Arrival Count using our new Status
        const lateArrivals = await Attendance.count({
            where: {
                timestamp: { [Op.gte]: today },
                status: 'Late',
                TenantId: req.user.TenantId
            }
        });

        const onLeave = 0; // Placeholder

        res.json({
            totalEmployees,
            presentToday,
            lateArrivals,
            onLeave
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getRecentLogs = async (req, res) => {
    try {
        const logs = await Attendance.findAll({
            where: { TenantId: req.user.TenantId },
            include: [User],
            order: [['timestamp', 'DESC']],
            limit: 10
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
