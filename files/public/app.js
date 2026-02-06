// Core App Logic & Dashboard

const API_URL = '/api';

// Time Display
function updateTime() {
    const timeDisplay = document.getElementById('currentTime');
    const dateDisplay = document.getElementById('currentDate');

    if (timeDisplay && dateDisplay) {
        const now = new Date();
        timeDisplay.textContent = now.toLocaleTimeString('en-US', { hour12: true });
        dateDisplay.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
}
setInterval(updateTime, 1000);
updateTime();

// Utility: Show Toast
function showToast(message, type = 'info') {
    // Check if toast container exists
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
        padding: 1rem 1.5rem;
        background: var(--secondary-bg);
        color: var(--text-primary);
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border-left: 5px solid ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--accent)'};
        animation: slideIn 0.3s ease-out forwards;
        min-width: 300px;
    `;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Utility: Fetch UI Wrapper
async function apiCall(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        // Auth Token
        const token = localStorage.getItem('token');
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        if (body) options.body = JSON.stringify(body);

        const res = await fetch(`${API_URL}${endpoint}`, options);

        // Handle Auth Errors Redirect
        if (res.status === 401 || res.status === 403) {
            window.location.href = 'login.html';
            return null;
        }

        // Handle No Content
        if (res.status === 204) return {};

        const data = await res.json();

        // Handle Protocol Errors (4xx, 5xx)
        if (!res.ok) {
            console.error('API Error Response:', data);
            showToast(data.error || 'Operation failed', 'error');
            return null; // Return null so calling function knows it failed
        }

        return data; // Success
    } catch (error) {
        console.error('API Error:', error);
        showToast('Connection error', 'error');
        return null;
    }
}

// Dashboard Logic
async function loadDashboardStats() {
    if (!document.getElementById('totalEmployees')) return;

    const stats = await apiCall('/attendance/stats');
    if (stats) {
        document.getElementById('totalEmployees').textContent = stats.totalEmployees || 0;
        document.getElementById('presentToday').textContent = stats.presentToday || 0;
        document.getElementById('lateArrivals').textContent = stats.lateArrivals || 0;
        document.getElementById('onLeave').textContent = stats.onLeave || 0;
    }
}

async function loadRecentAttendance() {
    const tbody = document.getElementById('recentAttendance');
    if (!tbody) return;

    const logs = await apiCall('/attendance/logs');
    if (logs) {
        tbody.innerHTML = logs.map(log => `
            <tr>
                <td>
                    <div class="employee-info">
                        <div class="employee-avatar">${log.User ? log.User.name.charAt(0) : '?'}</div>
                        <div class="employee-details">
                            <h4>${log.User ? log.User.name : 'Unknown'}</h4>
                            <p>${log.User ? log.User.department : ''}</p>
                        </div>
                    </div>
                </td>
                <td>${new Date(log.timestamp).toLocaleTimeString()}</td>
                <td>--</td>
                <td><span class="status-badge ${log.status === 'CheckIn' ? 'present' : 'absent'}">${log.status}</span></td>
            </tr>
        `).join('');
    }
}

async function loadDashboardDevices() {
    const grid = document.getElementById('deviceGrid');
    if (!grid) return;

    const devices = await apiCall('/devices');
    const noDevices = document.getElementById('noDevices');

    if (!devices || devices.length === 0) {
        grid.style.display = 'none';
        if (noDevices) noDevices.style.display = 'block';
        return;
    }

    if (noDevices) noDevices.style.display = 'none';
    grid.style.display = 'grid';

    grid.innerHTML = devices.map(device => `
        <div class="device-card ${device.status === 'offline' ? 'offline' : ''}" onclick="window.location.href='devices.html'">
            <div class="device-status"></div>
            <div class="device-name">${device.name}</div>
            <div class="device-location">${device.location || 'Unknown'}</div>
            <div class="device-info">
                <span>${device.status === 'online' ? 'Online' : 'Offline'}</span>
                <span>${device.ip}</span>
            </div>
        </div>
    `).join('');
}

// Chart Logic
async function loadCharts() {
    const ctx = document.getElementById('attendanceChart');
    if (!ctx) return;

    // Fetch Stats for chart (mocking history for now as api gives single day)
    // Ideally we need an endpoint /stats/history
    const stats = await apiCall('/attendance/stats');

    // Calculate absent (Total - Present)
    const total = stats?.totalEmployees || 0;
    const present = stats?.presentToday || 0;
    const late = stats?.lateArrivals || 0;
    const absent = Math.max(0, total - present);

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Present', 'Late', 'Absent'],
            datasets: [{
                data: [present - late, late, absent],
                backgroundColor: ['#00FF94', '#FFB02E', '#FF4B4B'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#B0C4DE' }
                }
            }
        }
    });

    // Add Weekly Chart if canvas exists
    // (We need to add this canvas to index.html first if we want it)
    // For now, let's just make sure the doughnut chart looks good.
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const token = localStorage.getItem('token');
    const companyName = localStorage.getItem('companyName'); // Retrieve Company Name
    const isLoginPage = window.location.pathname.includes('login.html');

    if (!token && !isLoginPage) {
        window.location.href = 'login.html';
        return;
    }

    if (token && isLoginPage) {
        window.location.href = 'index.html';
        return;
    }

    // Display Company Name
    const companyHeader = document.getElementById('companyName');
    if (companyHeader && companyName) {
        companyHeader.innerText = `Welcome, ${companyName}`;
    }

    // Logout Handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole');
            window.location.href = 'login.html';
        });
    }

    // Check if on Dashboard
    if (document.getElementById('totalEmployees')) {
        loadDashboardStats();
        loadRecentAttendance();
        loadDashboardDevices();
        loadCharts();

        // Refresh every 30s
        setInterval(() => {
            loadDashboardStats();
            loadRecentAttendance();
        }, 30000);
    }
});
