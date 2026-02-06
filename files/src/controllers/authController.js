const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Tenant } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_in_production';

exports.registerTenant = async (req, res) => {
    const { companyName, email, password, plan } = req.body;

    try {
        // 1. Create Tenant
        const tenant = await Tenant.create({
            name: companyName,
            email: email,
            plan: plan || 'Free'
        });

        // 2. Create Admin User
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await User.create({
            name: 'Admin',
            email: email,
            password: hashedPassword,
            role: 'admin',
            employeeId: 'ADMIN-' + Math.floor(Math.random() * 10000), // temp ID
            TenantId: tenant.id
        });

        res.status(201).json({ message: 'Tenant registered successfully', tenantId: tenant.id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({
            where: { email },
            include: [{ model: Tenant }]
        });
        if (!user) return res.status(400).json({ error: 'Invalid email or password' });

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).json({ error: 'Invalid email or password' });

        // Check for Tenant Association OR Super Admin Role
        if (!user.TenantId && user.role !== 'super_admin') {
            return res.status(403).json({ error: 'User not associated with any tenant' });
        }

        // Generate Token
        const token = jwt.sign({
            id: user.id,
            role: user.role,
            TenantId: user.TenantId,
            name: user.name
        }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            token,
            role: user.role,
            name: user.name,
            companyName: user.Tenant ? user.Tenant.name : 'AttendX Platform'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.me = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, { attributes: ['id', 'name', 'email', 'role'] });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
