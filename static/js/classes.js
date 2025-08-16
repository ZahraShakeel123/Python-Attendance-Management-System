// Classes management functionality
document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return;
    if (!checkRole(['Admin', 'Teacher'])) return;
    
    await loadClasses();
    setupModalFunctionality();
});

// Modal functionality
function setupModalFunctionality() {
    const modal = document.getElementById('classModal');
    const addClassBtn = document.getElementById('addClassBtn');
    const closeModal = document.querySelector('.close-modal');
    const classForm = document.getElementById('classForm');
    
    // Open modal for adding new class
    if (addClassBtn) {
        addClassBtn.addEventListener('click', () => {
            openModal('add');
        });
    }
    
    // Close modal
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            closeModalFunction();
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModalFunction();
        }
    });
    
    // Form submission
    if (classForm) {
        classForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const classId = document.getElementById('classId').value;
            if (classId) {
                await updateClass();
            } else {
                await addClass();
            }
            closeModalFunction();
        });
    }
}

function openModal(mode, classData = null) {
    const modal = document.getElementById('classModal');
    const modalTitle = document.getElementById('modalTitle');
    const classForm = document.getElementById('classForm');
    const classIdField = document.getElementById('classId');
    const classNameField = document.getElementById('className');
    const maleStudentsField = document.getElementById('maleStudents');
    const femaleStudentsField = document.getElementById('femaleStudents');
    
    if (mode === 'add') {
        modalTitle.textContent = 'Add New Class';
        classForm.reset();
        classIdField.value = '';
    } else if (mode === 'edit' && classData) {
        modalTitle.textContent = 'Edit Class';
        classIdField.value = classData.id;
        classNameField.value = classData.name;
        maleStudentsField.value = classData.male_count;
        femaleStudentsField.value = classData.female_count;
    }
    
    modal.style.display = 'block';
}

function closeModalFunction() {
    const modal = document.getElementById('classModal');
    modal.style.display = 'none';
}

async function loadClasses() {
    try {
        const classes = await apiCall('/classes');
        
        const classesTable = document.getElementById('classesTable');
        if (classesTable) {
            if (classes.length === 0) {
                classesTable.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #666;">No classes found</td></tr>';
            } else {
                classesTable.innerHTML = classes.map(cls => `
                    <tr>
                        <td>${cls.name}</td>
                        <td>${cls.male_count + cls.female_count}</td>
                        <td>${cls.male_count}</td>
                        <td>${cls.female_count}</td>
                        <td>
                            <button class="btn btn-primary" onclick="editClass(${cls.id}, '${cls.name}', ${cls.male_count}, ${cls.female_count})">Edit</button>
                            <button class="btn btn-secondary" onclick="deleteClass(${cls.id})">Delete</button>
                        </td>
                    </tr>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading classes:', error);
        showAlert('Error loading classes', 'error');
    }
}

async function addClass() {
    const name = document.getElementById('className').value;
    const maleCount = parseInt(document.getElementById('maleStudents').value) || 0;
    const femaleCount = parseInt(document.getElementById('femaleStudents').value) || 0;
    
    if (!name) {
        showAlert('Please enter a class name', 'warning');
        return;
    }
    
    try {
        await apiCall('/classes', {
            method: 'POST',
            body: JSON.stringify({
                name: name,
                male_count: maleCount,
                female_count: femaleCount
            })
        });
        
        showAlert('Class added successfully');
        await loadClasses();
    } catch (error) {
        console.error('Error adding class:', error);
        showAlert('Error adding class', 'error');
    }
}

async function editClass(classId, className, maleCount, femaleCount) {
    const classData = {
        id: classId,
        name: className,
        male_count: maleCount,
        female_count: femaleCount
    };
    openModal('edit', classData);
}

async function updateClass() {
    const classId = document.getElementById('classId').value;
    const name = document.getElementById('className').value;
    const maleCount = parseInt(document.getElementById('maleStudents').value) || 0;
    const femaleCount = parseInt(document.getElementById('femaleStudents').value) || 0;
    
    if (!name) {
        showAlert('Please enter a class name', 'warning');
        return;
    }
    
    try {
        await apiCall(`/classes/${classId}`, {
            method: 'PUT',
            body: JSON.stringify({
                name: name,
                male_count: maleCount,
                female_count: femaleCount
            })
        });
        
        showAlert('Class updated successfully');
        await loadClasses();
    } catch (error) {
        console.error('Error updating class:', error);
        showAlert('Error updating class', 'error');
    }
}

async function deleteClass(classId) {
    if (!confirm('Are you sure you want to delete this class?')) {
        return;
    }
    
    try {
        await apiCall(`/classes/${classId}`, {
            method: 'DELETE'
        });
        
        showAlert('Class deleted successfully');
        await loadClasses();
    } catch (error) {
        console.error('Error deleting class:', error);
        showAlert('Error deleting class', 'error');
    }
}

// Search functionality
function searchClasses() {
    const searchTerm = document.getElementById('searchClass').value.toLowerCase();
    const rows = document.querySelectorAll('#classesTable tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Add search event listener
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchClass');
    if (searchInput) {
        searchInput.addEventListener('input', searchClasses);
    }
}); 