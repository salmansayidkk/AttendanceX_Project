// Device Management Logic

// Shared API_URL and showToast are in app.js (assume loaded first)

// Load Devices
async function loadDevices() {
    const devices = await apiCall('/devices');
    const deviceGrid = document.getElementById('deviceGrid');
    const noDevices = document.getElementById('noDevices');

    // Update stats
    if (devices) {
        document.getElementById('totalDevices').textContent = devices.length;
        document.getElementById('onlineDevices').textContent = devices.filter(d => d.status === 'online').length;
        document.getElementById('offlineDevices').textContent = devices.filter(d => d.status === 'offline').length;
    }

    if (!devices || devices.length === 0) {
        deviceGrid.style.display = 'none';
        noDevices.style.display = 'block';
        return;
    }

    deviceGrid.style.display = 'grid';
    noDevices.style.display = 'none';

    deviceGrid.innerHTML = devices.map(device => `
        <div class="device-card ${device.status === 'offline' ? 'offline' : ''}">
            <div class="device-status"></div>
            <div class="device-name">${device.name}</div>
            <div class="device-location">${device.location}</div>
            <div style="color: var(--text-secondary); font-size: 0.85rem; margin: 0.5rem 0;">
                ${device.ip}:${device.port}
            </div>
            <div class="action-menu" style="margin-top: 1rem; display: flex; gap: 0.5rem; justify-content: center;">
                <button class="btn btn-secondary" onclick="syncDevice('${device.id}')" title="Sync Logs">🔄 Sync Logs</button>
                <button class="btn btn-primary" onclick="syncUsersToDevice('${device.id}')" title="Push Users">📤 Push Users</button>
            </div>
        </div>
    `).join('');
}

// Add Device
async function addDevice(event) {
    event.preventDefault();

    const device = {
        name: document.getElementById('deviceName').value,
        location: document.getElementById('deviceLocation').value,
        ip: document.getElementById('deviceIP').value,
        port: document.getElementById('devicePort').value || 4370,
    };

    showToast('Adding device...', 'info');

    const result = await apiCall('/devices', 'POST', device);

    if (result && !result.error) {
        showToast('Device added successfully!', 'success');
        closeModal('addDeviceModal');
        document.getElementById('addDeviceForm').reset();
        loadDevices();
    } else {
        showToast(result?.error || 'Failed to add device', 'error');
    }
}

// Sync Device
async function syncDevice(id) {
    showToast('Starting sync...', 'info');
    const res = await apiCall(`/devices/${id}/sync`, 'POST');
    if (res && !res.error) {
        showToast('Sync completed', 'success');
    } else {
        showToast('Sync failed', 'error');
    }
}

async function syncUsersToDevice(id) {
    showToast('Pushing users to device...', 'info');
    const res = await apiCall(`/devices/${id}/sync-users`, 'POST');
    if (res && !res.error) {
        showToast(res.message, 'success');
    } else {
        showToast('Push failed', 'error');
    }
}

// Mock Modal Functions (since we removed inline script that defined them)
function openModal(id) {
    document.getElementById(id).style.display = 'block';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('deviceGrid')) {
        loadDevices();
    }
});
