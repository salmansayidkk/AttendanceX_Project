// Attendance Logic

// Shared API_URL and showToast are in app.js

async function loadAttendance() {
    const tbody = document.getElementById('attendanceTable');
    if (!tbody) return;

    // Fetch recent logs
    const logs = await apiCall('/attendance/logs');

    if (!logs) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No logs found</td></tr>';
        return;
    }

    // Client-side filtering can be added here similar to Employees

    tbody.innerHTML = logs.map(log => `
        <tr>
            <td>
                <div class="employee-info">
                    <div class="employee-avatar">${log.User ? log.User.name.charAt(0) : '?'}</div>
                    <div class="employee-details">
                        <h4>${log.User ? log.User.name : 'Unknown User'}</h4>
                        <p>${log.User ? log.User.department : ''}</p>
                    </div>
                </div>
            </td>
            <td>${new Date(log.timestamp).toLocaleDateString()}</td>
            <td>${new Date(log.timestamp).toLocaleTimeString()}</td>
            <td>-</td> <!-- Check-out logic requires pairing events -->
            <td>-</td>
            <td><span class="status-badge ${log.status.toLowerCase()}">${log.status}</span></td>
        </tr>
    `).join('');
}

async function syncAttendance() {
    // In a real app, this might trigger a server-side job
    showToast('Requesting sync from all devices...', 'info');
    // We could iterate connected devices and call sync endpoint
    // For now, just simulated success
    setTimeout(() => {
        showToast('Sync completed', 'success');
        loadAttendance();
    }, 2000);
}

// Helpers
function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('attendanceTable')) {
        loadAttendance();
    }
});

// Expose
window.syncAttendance = syncAttendance;
window.filterAttendance = loadAttendance; // Reload for now
