// Shifts Logic

async function loadShifts() {
    const list = document.getElementById('shiftsList');
    if (!list) return;

    const shifts = await apiCall('/shifts');

    if (!shifts || shifts.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No shifts found. Create one to get started.</p>';
        return;
    }

    list.innerHTML = shifts.map(shift => `
        <div class="shift-card">
            <div>
                <h4 style="font-size: 1.2rem; margin-bottom: 0.2rem;">${shift.name}</h4>
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <span class="shift-time">${shift.startTime} - ${shift.endTime}</span>
                    <span style="font-size: 0.9rem; color: var(--text-secondary);">Tolerance: ${shift.lateTolerance}m</span>
                </div>
            </div>
            <button class="btn btn-secondary" onclick="deleteShift('${shift.id}')" style="padding: 0.5rem 0.8rem;">🗑️</button>
        </div>
    `).join('');
}

async function saveShift(e) {
    e.preventDefault();

    const shift = {
        name: document.getElementById('shiftName').value,
        startTime: document.getElementById('startTime').value,
        endTime: document.getElementById('endTime').value,
        lateTolerance: document.getElementById('lateTolerance').value
    };

    showToast('Saving shift...', 'info');
    const res = await apiCall('/shifts', 'POST', shift);

    if (res && res.id) {
        showToast('Shift created successfully', 'success');
        closeModal('addShiftModal');
        document.getElementById('addShiftForm').reset();
        loadShifts();
    } else {
        showToast('Failed to create shift', 'error');
    }
}

async function deleteShift(id) {
    if (!confirm('Delete this shift?')) return;

    const res = await apiCall(`/shifts/${id}`, 'DELETE');
    if (res === undefined || res === null || !res.error) {
        showToast('Shift deleted', 'success');
        loadShifts();
    } else {
        showToast('Failed to delete', 'error');
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadShifts();
});

// Expose
window.saveShift = saveShift;
window.deleteShift = deleteShift;
window.openModal = function (id) { document.getElementById(id).style.display = 'block'; };
window.closeModal = function (id) { document.getElementById(id).style.display = 'none'; };
