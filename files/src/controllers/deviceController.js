const { Device } = require('../models');
const zkTecoService = require('../services/zkteco');

exports.getAllDevices = async (req, res) => {
    try {
        const devices = await Device.findAll({ where: { TenantId: req.user.TenantId } });
        res.json(devices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addDevice = async (req, res) => {
    try {
        const { name, ip, port, location } = req.body;
        const device = await Device.create({
            name, ip, port, location,
            TenantId: req.user.TenantId
        });

        // Try connecting immediately
        zkTecoService.connectDevice(device);

        res.status(201).json(device);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.syncDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const device = await Device.findOne({
            where: { id: id, TenantId: req.user.TenantId }
        });
        if (!device) return res.status(404).json({ error: 'Device not found' });

        await zkTecoService.syncLogs(device);
        res.json({ message: 'Sync started' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.syncUsers = async (req, res) => {
    try {
        const { id } = req.params;
        const device = await Device.findOne({
            where: { id: id, TenantId: req.user.TenantId }
        });
        if (!device) return res.status(404).json({ error: 'Device not found' });

        const { User } = require('../models');
        const users = await User.findAll({ where: { TenantId: req.user.TenantId } });

        await zkTecoService.uploadUsers(device, users);
        res.json({ message: `Syncing ${users.length} users to device...` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
