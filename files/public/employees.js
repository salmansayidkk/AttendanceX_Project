// Employee Management Logic

// Shared API_URL and showToast are in app.js

async function loadEmployees() {
    const tbody = document.getElementById('employeeTable');
    if (!tbody) return;

    // Get filters
    const search = document.getElementById('searchEmployee')?.value.toLowerCase();
    const dept = document.getElementById('filterDepartment')?.value;

    // Fetch all (filtering on client side for now as API is simple)
    const employees = await apiCall('/employees');

    if (!employees) return;

    let filtered = employees;
    if (search || dept) {
        filtered = employees.filter(emp => {
            const matchSearch = !search ||
                emp.name.toLowerCase().includes(search) ||
                emp.employeeId.toLowerCase().includes(search) ||
                emp.email.toLowerCase().includes(search);
            const matchDept = !dept || emp.department === dept;
            return matchSearch && matchDept;
        });
    }

    tbody.innerHTML = filtered.map(emp => `
        <tr>
            <td>
                <div class="employee-info">
                    <div class="employee-avatar">${getInitials(emp.name)}</div>
                    <div class="employee-details">
                        <h4>${emp.name}</h4>
                        <p>${emp.employeeId}</p>
                    </div>
                </div>
            </td>
            <td>${emp.department}</td>
            <td>${emp.position}</td>
            <td>${emp.email}</td>
            <td><span class="status-badge ${emp.status}">${emp.status}</span></td>
            <td>
                <div class="action-menu">
                    <button class="action-btn" onclick="viewEmployee('${emp.id}')" title="View">👁️</button>
                    <button class="action-btn" onclick="editEmployee('${emp.id}')" title="Edit">✏️</button>
                    <button class="action-btn" onclick="deleteEmployee('${emp.id}')" title="Delete">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function saveEmployee(e) {
    e.preventDefault();

    const id = document.getElementById('dbId').value; // Hidden DB ID
    const empData = {
        name: document.getElementById('empName').value,
        employeeId: document.getElementById('empId').value,
        email: document.getElementById('empEmail').value,
        phone: document.getElementById('empPhone').value,
        department: document.getElementById('empDepartment').value,
        position: document.getElementById('empPosition').value,
        salary: document.getElementById('empSalary').value,
        ShiftId: document.getElementById('empShift').value || null
    };

    let res;
    showToast('Saving employee...', 'info');

    if (id) {
        // Update
        res = await apiCall(`/employees/${id}`, 'PUT', empData);
    } else {
        // Create
        res = await apiCall('/employees', 'POST', empData);
    }

    if (res && !res.error) {
        showToast('Employee saved successfully', 'success');
        closeModal('addEmployeeModal');
        document.getElementById('addEmployeeForm').reset();
        document.getElementById('dbId').value = ''; // Reset ID
        document.getElementById('modalTitle').textContent = 'Add Employee';
        document.getElementById('empId').value = generateEmployeeId();
        loadEmployees();
    } else {
        showToast(res?.error || 'Failed to save employee', 'error');
    }
}

async function editEmployee(id) {
    showToast('Loading employee details...', 'info');
    const emp = await apiCall(`/employees/${id}`);

    if (emp && !emp.error) {
        document.getElementById('modalTitle').textContent = 'Edit Employee';
        document.getElementById('dbId').value = emp.id;
        document.getElementById('empName').value = emp.name;
        document.getElementById('empId').value = emp.employeeId;
        document.getElementById('empEmail').value = emp.email;
        document.getElementById('empPhone').value = emp.phone || '';
        document.getElementById('empDepartment').value = emp.department;
        document.getElementById('empPosition').value = emp.position;
        document.getElementById('empSalary').value = emp.salary;

        await loadShiftOptions();
        document.getElementById('empShift').value = emp.ShiftId || '';

        openModal('addEmployeeModal');
    }
}

async function loadShiftOptions() {
    const shifts = await apiCall('/shifts');
    const select = document.getElementById('empShift');
    if (!select) return;

    select.innerHTML = '<option value="">No Shift Assigned</option>' +
        (shifts || []).map(s => `<option value="${s.id}">${s.name} (${s.startTime}-${s.endTime})</option>`).join('');
}

async function deleteEmployee(id) {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    showToast('Deleting employee...', 'warning');
    const res = await apiCall(`/employees/${id}`, 'DELETE');

    // DELETE returns 204 no content usually, or just success
    // apiCall might return null or empty object on 204
    if (res === undefined || res === null || !res.error) {
        showToast('Employee deleted successfully', 'success');
        loadEmployees();
    } else {
        showToast('Failed to delete employee', 'error');
    }
}

// Helpers
function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function generateEmployeeId() {
    return 'EMP' + Math.floor(1000 + Math.random() * 9000);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('employeeTable')) {
        loadEmployees();

        // Init ID
        const idInput = document.getElementById('empId');
        if (idInput) idInput.value = generateEmployeeId();
    }
});

// Expose functions globally
window.saveEmployee = saveEmployee;
window.editEmployee = editEmployee;
window.deleteEmployee = deleteEmployee;
window.loadEmployees = loadEmployees;
window.filterEmployees = loadEmployees;
window.openModal = function (id) {
    if (id === 'addEmployeeModal') {
        // Reset if opening to add
        loadShiftOptions(); // Load shifts
        if (!document.getElementById('dbId').value) {
            document.getElementById('addEmployeeForm').reset();
            document.getElementById('empId').value = generateEmployeeId();
            document.getElementById('modalTitle').textContent = 'Add Employee';
        }
    }
    document.getElementById(id).style.display = 'block';
};
window.closeModal = function (id) {
    document.getElementById(id).style.display = 'none';
    // Clear editing state on close
    document.getElementById('dbId').value = '';
    document.getElementById('modalTitle').textContent = 'Add Employee';
};
