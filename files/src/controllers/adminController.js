const { Tenant, User } = require('../models');

exports.getAllTenants = async (req, res) => {
    try {
        // In a real production app, verify req.user.role === 'super_admin'
        // For this demo, we assume the route is protected or open for demo purposes.

        const tenants = await Tenant.findAll({
            include: [{
                model: User,
                attributes: ['id'] // Just to count
            }],
            order: [['createdAt', 'DESC']]
        });

        const data = tenants.map(t => ({
            id: t.id,
            name: t.name,
            createdAt: t.createdAt,
            userCount: t.Users ? t.Users.length : 0
        }));

        res.json(data);
    } catch (error) {
        console.error('Admin Fetch Error:', error);
        res.status(500).json({ error: 'Failed to fetch tenants' });
    }
};

const bcrypt = require('bcryptjs');

exports.resetTenantPassword = async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    try {
        const tenant = await Tenant.findByPk(id);
        if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

        // Find the admin user for this tenant
        // Assumption: The user who created the tenant is the "Admin" or has 'admin' role
        const adminUser = await User.findOne({
            where: {
                TenantId: id,
                role: 'admin'
            }
        });

        if (!adminUser) return res.status(404).json({ error: 'Admin user for tenant not found' });

        const hashedPassword = await bcrypt.hash(password, 10);
        adminUser.password = hashedPassword;
        await adminUser.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
};

exports.deleteTenant = async (req, res) => {
    const { id } = req.params;
    try {
        const tenant = await Tenant.findByPk(id);
        if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

        // Cascade delete should handle associations if set up, but let's be explicit if needed.
        // For now, simple destroy.
        await tenant.destroy();

        res.json({ message: 'Tenant deleted successfully' });
    } catch (error) {
        console.error('Delete Tenant Error:', error);
        res.status(500).json({ error: 'Failed to delete tenant' });
    }
};

// --- System User Management ---

exports.getSystemUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            where: {
                TenantId: null
            },
            attributes: ['id', 'name', 'email', 'role', 'createdAt']
        });
        res.json(users);
    } catch (error) {
        console.error('Get System Users Error:', error);
        res.status(500).json({ error: 'Failed to fetch system users' });
    }
};

exports.createSystemUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'admin',
            TenantId: null,
            employeeId: 'SYS-' + Math.floor(Math.random() * 10000)
        });
        res.status(201).json({ message: 'System user created', userId: user.id });
    } catch (error) {
        console.error('Create System User Error:', error);
        let msg = error.message;
        if (error.name === 'SequelizeUniqueConstraintError') {
            msg = 'Email already exists. Please use a different email.';
        }
        res.status(400).json({ error: msg });
    }
};

exports.deleteSystemUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.TenantId !== null) return res.status(403).json({ error: 'Cannot delete tenant users from this endpoint' });

        await user.destroy();
        res.json({ message: 'System user deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
