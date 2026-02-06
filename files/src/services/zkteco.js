const ZKLib = require('node-zklib');
const { Device, Attendance, User } = require('../models');

class ZKTecoService {
    constructor() {
        this.connections = new Map(); // ip -> zkInstance
    }

    async connectDevice(device) {
        console.log(`Attempting to connect to ${device.ip}...`);

        // Mock Mode for development if IP is 'mock'
        if (device.ip === 'mock') {
            return this.startMockDevice(device);
        }

        try {
            const zk = new ZKLib(device.ip, device.port, 10000, 4000);
            await zk.createSocket();
            this.connections.set(device.ip, zk);

            // Update status
            device.status = 'online';
            await device.save();
            console.log(`Connected to ${device.ip}`);
            return true;
        } catch (error) {
            console.error(`Failed to connect to ${device.ip}:`, error);
            device.status = 'offline';
            await device.save();
            return false;
        }
    }

    async syncLogs(device) {
        if (device.ip === 'mock') return [];

        const zk = this.connections.get(device.ip);
        if (!zk) return;

        try {
            const logs = await zk.getAttendances();
            // Process logs...
            // Note: node-zklib returns { deviceUserId, recordTime, ip }

            const newLogs = [];
            for (const log of logs) {
                // Find or create attendance record
                // Logic to avoid duplicates based on timestamp + user
                // Simple de-duplication logic here:

                const exists = await Attendance.findOne({
                    where: {
                        timestamp: log.recordTime,
                        // deviceUserId mapping needed to User table
                    }
                });

                if (!exists) {
                    // Find user by some ID mapping. For now, assuming deviceUserId maps to employeeId or we need a mapping table.
                    const { Shift } = require('../models');
                    const user = await User.findOne({
                        where: {
                            employeeId: log.deviceUserId,
                            TenantId: device.TenantId // Scope to Device's Tenant
                        },
                        include: Shift
                    });

                    if (user) {
                        let status = 'Present';

                        // Calculate Late Status if Shift is assigned
                        if (user.Shift) {
                            const logDate = new Date(log.recordTime);
                            const shiftStart = new Date(logDate);
                            const [h, m] = user.Shift.startTime.split(':');
                            shiftStart.setHours(h, m, 0);

                            // Apply Tolerance
                            const toleranceMs = (user.Shift.lateTolerance || 0) * 60000;

                            if (logDate > (shiftStart.getTime() + toleranceMs)) {
                                status = 'Late';
                            }
                        }

                        const rec = await Attendance.create({
                            timestamp: log.recordTime,
                            UserId: user.id,
                            DeviceId: device.id,
                            TenantId: device.TenantId, // Add TenantId
                            status: status
                        });
                        newLogs.push(rec);
                    }
                }
            }
            device.lastSync = new Date();
            await device.save();
            return newLogs;
        } catch (error) {
            console.error(`Sync error for ${device.ip}:`, error);
        }
    }

    startMockDevice(device) {
        console.log('Starting Mock Device...');
        device.status = 'online';
        device.save();

        // Return a mock "connection" object if needed, or just true
        return true;
    }

    // Mock data generator for demo purposes
    async generateMockLog(employeeId) {
        // ...
    }

    async uploadUsers(device, users) {
        if (device.ip === 'mock') {
            console.log(`[Mock] Uploaded ${users.length} users to device ${device.name}`);
            return true;
        }

        const zk = this.connections.get(device.ip);
        if (!zk) {
            const connected = await this.connectDevice(device);
            if (!connected) return false;
        }

        try {
            for (const user of users) {
                const uid = parseInt(user.id);
                const userid = user.employeeId;
                const name = user.name;

                console.log(`Uploading user ${name} (${userid}) to ${device.ip}`);
                if (zk.setUser) {
                    await zk.setUser(uid, userid, name, '', 0, 0);
                }
            }
            return true;
        } catch (error) {
            console.error(`Failed to upload users to ${device.ip}:`, error);
            return false;
        }
    }
}

module.exports = new ZKTecoService();
