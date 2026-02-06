const { User } = require('../models');

exports.getAllEmployees = async (req, res) => {
    try {
        const { Shift } = require('../models');
        const employees = await User.findAll({
            where: { TenantId: req.user.TenantId },
            include: Shift
        });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createEmployee = async (req, res) => {
    try {
        const employee = await User.create({
            ...req.body,
            TenantId: req.user.TenantId
        });
        res.status(201).json(employee);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getEmployee = async (req, res) => {
    try {
        const { Shift } = require('../models');
        const employee = await User.findOne({
            where: { id: req.params.id, TenantId: req.user.TenantId },
            include: Shift
        });
        if (!employee) return res.status(404).json({ error: 'Employee not found' });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const employee = await User.findOne({
            where: { id: req.params.id, TenantId: req.user.TenantId }
        });
        if (!employee) return res.status(404).json({ error: 'Employee not found' });

        await employee.update(req.body);
        res.json(employee);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const employee = await User.findOne({
            where: { id: req.params.id, TenantId: req.user.TenantId }
        });
        if (!employee) return res.status(404).json({ error: 'Employee not found' });

        await employee.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
