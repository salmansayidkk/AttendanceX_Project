const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const deviceController = require('../controllers/deviceController');
const adminController = require('../controllers/adminController');
const employeeController = require('../controllers/employeeController');
const attendanceController = require('../controllers/attendanceController');

// Auth Routes
router.post('/auth/register', authController.registerTenant);
router.post('/auth/login', authController.login);
router.get('/auth/me', auth, authController.me);

// Protected Routes (Apply 'auth' middleware to all below)
router.use(auth);

// Device Routes
router.get('/devices', deviceController.getAllDevices);
router.post('/devices', deviceController.addDevice);
router.post('/devices/:id/sync', deviceController.syncDevice);
router.post('/devices/:id/sync-users', deviceController.syncUsers);

// Employee Routes
router.get('/employees', employeeController.getAllEmployees);
router.post('/employees', employeeController.createEmployee);
router.get('/employees/:id', employeeController.getEmployee);
router.put('/employees/:id', employeeController.updateEmployee);
router.delete('/employees/:id', employeeController.deleteEmployee);

// Shift Routes
const shiftController = require('../controllers/shiftController');
router.get('/shifts', shiftController.getAllShifts);
router.post('/shifts', shiftController.createShift);
router.delete('/shifts/:id', shiftController.deleteShift);

// Attendance Routes
router.get('/attendance/stats', attendanceController.getStats);
router.get('/attendance/logs', attendanceController.getRecentLogs);

// ... existing routes ...

// Super Admin Routes
router.get('/tenants/all', adminController.getAllTenants);
router.post('/tenants/:id/reset-password', adminController.resetTenantPassword);
router.delete('/tenants/:id', adminController.deleteTenant);

// System User Routes
router.get('/admin/users', adminController.getSystemUsers);
router.post('/admin/users', adminController.createSystemUser);
router.delete('/admin/users/:id', adminController.deleteSystemUser);

module.exports = router;
