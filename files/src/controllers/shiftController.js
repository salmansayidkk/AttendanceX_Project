const { Shift } = require('../models');

exports.getAllShifts = async (req, res) => {
    try {
        const shifts = await Shift.findAll({ where: { TenantId: req.user.TenantId } });
        res.json(shifts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createShift = async (req, res) => {
    try {
        const shift = await Shift.create({
            ...req.body,
            TenantId: req.user.TenantId
        });
        res.status(201).json(shift);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteShift = async (req, res) => {
    try {
        const shift = await Shift.findOne({
            where: { id: req.params.id, TenantId: req.user.TenantId }
        });
        if (!shift) return res.status(404).json({ error: 'Shift not found' });
        await shift.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
