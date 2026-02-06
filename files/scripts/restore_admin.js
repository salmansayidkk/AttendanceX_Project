const { User, sequelize } = require('../src/models');
const bcrypt = require('bcryptjs');

async function createSuperAdmin() {
    try {
        await sequelize.sync(); // Ensure connection

        const email = 'admin@demo.com';
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Check if user exists (even if soft deleted or anything)
        let user = await User.findOne({ where: { email } });

        if (user) {
            console.log('User exists. Updating to Super Admin...');
            user.password = hashedPassword;
            user.role = 'super_admin';
            user.TenantId = null; // Detach from any tenant
            await user.save();
        } else {
            console.log('Creating new Super Admin...');
            user = await User.create({
                name: 'System Administrator',
                email: email,
                password: hashedPassword,
                role: 'super_admin',
                employeeId: 'SYS-ADMIN',
                TenantId: null
            });
        }

        console.log('Super Admin Access Restored:');
        console.log('Email: admin@demo.com');
        console.log('Password: password123');
        process.exit(0);
    } catch (error) {
        console.error('Error creating Super Admin:', error);
        process.exit(1);
    }
}

createSuperAdmin();
