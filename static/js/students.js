// Students management functionality
document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return;
    if (!checkRole(['Admin', 'Teacher'])) return;
    
    await loadClasses();
    await loadStudents();
    setupModalFunctionality();
});

// Modal functionality
function setupModalFunctionality() {
    const modal = document.getElementById('studentModal');
    const addStudentBtn = document.getElementById('addStudentBtn');
    const closeModal = document.querySelector('.close-modal');
    const studentForm = document.getElementById('studentForm');
    
    // Open modal for adding new student
    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', () => {
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
    if (studentForm) {
        studentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const studentId = document.getElementById('studentId').value;
            if (studentId) {
                await updateStudent();
                closeModalFunction(); // Close modal after editing
            } else {
                await addStudent();
                closeModalFunction(); // Close modal after adding student
            }
        });
    }
}

function openModal(mode, studentData = null) {
    const modal = document.getElementById('studentModal');
    const modalTitle = document.getElementById('modalTitle');
    const studentForm = document.getElementById('studentForm');
    const studentIdField = document.getElementById('studentId');
    const studentNameField = document.getElementById('studentName');
    const registrationNumberField = document.getElementById('registrationNumber');
    const studentClassField = document.getElementById('studentClass');
    const userIdField = document.getElementById('userId');
    
    if (mode === 'add') {
        modalTitle.textContent = 'Add New Student';
        studentForm.reset();
        studentIdField.value = '';
        
        // Clear class selection for new student
        if (studentClassField) {
            studentClassField.value = '';
        }
        
        // Clear gender selection
        const genderRadios = document.querySelectorAll('input[name="studentGender"]');
        genderRadios.forEach(radio => {
            radio.checked = false;
        });
        
        // Show helpful message for new students
        setTimeout(() => {
            const selectedClass = document.getElementById('studentClass');
            if (selectedClass && selectedClass.value) {
                const className = selectedClass.options[selectedClass.selectedIndex].text;
                showAlert(`Tip: Adding student to class "${className}". Remember: Each student needs a unique registration number.`, 'success');
            } else {
                showAlert('Tip: Each student needs a unique registration number. Multiple students can be added to the same class.', 'success');
            }
        }, 500);
    } else if (mode === 'edit' && studentData) {
        modalTitle.textContent = 'Edit Student';
        studentIdField.value = studentData.id;
        studentNameField.value = studentData.name;
        registrationNumberField.value = studentData.registration_number;
        studentClassField.value = studentData.class_id;
        userIdField.value = studentData.user_id || '';
        
        // Set gender radio button
        const genderRadios = document.querySelectorAll('input[name="studentGender"]');
        genderRadios.forEach(radio => {
            radio.checked = radio.value === studentData.gender;
        });
    }
    
    modal.style.display = 'block';
}

function closeModalFunction() {
    const modal = document.getElementById('studentModal');
    modal.style.display = 'none';
}

async function loadClasses() {
    try {
        const classes = await apiCall('/classes');
        
        const classSelect = document.getElementById('studentClass');
        if (classSelect) {
            // Remove existing event listeners by cloning the element
            const newClassSelect = classSelect.cloneNode(true);
            classSelect.parentNode.replaceChild(newClassSelect, classSelect);
            
            newClassSelect.innerHTML = '<option value="">Select a class</option>';
            classes.forEach(cls => {
                newClassSelect.innerHTML += `<option value="${cls.id}">${cls.name}</option>`;
            });
            
            // Add change event listener to show helpful message
            newClassSelect.addEventListener('change', function() {
                if (this.value) {
                    const className = this.options[this.selectedIndex].text;
                    showAlert(`Selected class: "${className}". You can add multiple students to this class.`, 'success');
                }
            });
        }
    } catch (error) {
        console.error('Error loading classes:', error);
        showAlert('Error loading classes', 'error');
    }
}

async function loadStudents() {
    try {
        const students = await apiCall('/students');
        
        const studentsTable = document.getElementById('studentsTable');
        if (studentsTable) {
            if (students.length === 0) {
                studentsTable.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #666;">No students found</td></tr>';
            } else {
                studentsTable.innerHTML = students.map(student => `
                    <tr>
                        <td>${student.name}</td>
                        <td>${student.registration_number}</td>
                        <td>${student.class_name}</td>
                        <td>${student.gender}</td>
                        <td>
                            <button class="btn btn-primary" onclick="editStudent(${student.id}, '${student.name}', '${student.registration_number}', ${student.class_id}, '${student.gender}', ${student.user_id || 'null'})">Edit</button>
                            <button class="btn btn-secondary" onclick="deleteStudent(${student.id})">Delete</button>
                        </td>
                    </tr>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading students:', error);
        showAlert('Error loading students', 'error');
    }
}

async function addStudent() {
    const name = document.getElementById('studentName').value.trim();
    const registrationNumber = document.getElementById('registrationNumber').value.trim();
    const classId = document.getElementById('studentClass').value;
    const gender = document.querySelector('input[name="studentGender"]:checked')?.value;
    const userId = document.getElementById('userId').value || null;
    
    if (!name || !registrationNumber || !classId || !gender) {
        let missingFields = [];
        if (!name) missingFields.push('Student Name');
        if (!registrationNumber) missingFields.push('Registration Number');
        if (!classId) missingFields.push('Class');
        if (!gender) missingFields.push('Gender');
        
        showAlert(`Please fill in the following required fields: ${missingFields.join(', ')}`, 'warning');
        return;
    }
    
    // Check if registration number contains only valid characters
    if (!/^[a-zA-Z0-9\-_]+$/.test(registrationNumber)) {
        showAlert('Registration number can only contain letters, numbers, hyphens, and underscores.', 'warning');
        return;
    }
    
    try {
        // Show loading message with student details
        const selectedClass = document.getElementById('studentClass');
        const className = selectedClass.options[selectedClass.selectedIndex].text;
        showAlert(`Adding student "${name}" to class "${className}"... Please wait.`, 'success');
        
        const response = await apiCall('/students', {
            method: 'POST',
            body: JSON.stringify({
                name: name,
                registration_number: registrationNumber,
                class_id: parseInt(classId),
                gender: gender,
                user_id: userId ? parseInt(userId) : null
            })
        });
        
        showAlert(`Student "${name}" added successfully to class "${className}"!`);
        
        // Update the students table
        await loadStudents();
        
    } catch (error) {
        console.error('Error adding student:', error);
        
        // Show specific error message if available
        if (error.message && error.message !== 'Error adding student') {
            showAlert(error.message, 'error');
        } else {
            showAlert('Error adding student. Please check all fields and try again.', 'error');
        }
    }
}

async function editStudent(studentId, studentName, registrationNumber, classId, gender, userId) {
    const studentData = {
        id: studentId,
        name: studentName,
        registration_number: registrationNumber,
        class_id: classId,
        gender: gender,
        user_id: userId
    };
    openModal('edit', studentData);
}

async function updateStudent() {
    const studentId = document.getElementById('studentId').value;
    const name = document.getElementById('studentName').value;
    const registrationNumber = document.getElementById('registrationNumber').value;
    const classId = document.getElementById('studentClass').value;
    const gender = document.querySelector('input[name="studentGender"]:checked')?.value;
    const userId = document.getElementById('userId').value || null;
    
    if (!name || !registrationNumber || !classId || !gender) {
        let missingFields = [];
        if (!name) missingFields.push('Student Name');
        if (!registrationNumber) missingFields.push('Registration Number');
        if (!classId) missingFields.push('Class');
        if (!gender) missingFields.push('Gender');
        
        showAlert(`Please fill in the following required fields: ${missingFields.join(', ')}`, 'warning');
        return;
    }
    
    try {
        await apiCall(`/students/${studentId}`, {
            method: 'PUT',
            body: JSON.stringify({
                name: name,
                registration_number: registrationNumber,
                class_id: classId,
                gender: gender,
                user_id: userId
            })
        });
        
        showAlert('Student updated successfully');
        await loadStudents();
    } catch (error) {
        console.error('Error updating student:', error);
        
        // Show specific error message if available
        if (error.message && error.message !== 'Error updating student') {
            showAlert(error.message, 'error');
        } else {
            showAlert('Error updating student. Please check all fields and try again.', 'error');
        }
    }
}

async function deleteStudent(studentId) {
    if (!confirm('Are you sure you want to delete this student?')) {
        return;
    }
    
    try {
        await apiCall(`/students/${studentId}`, {
            method: 'DELETE'
        });
        
        showAlert('Student deleted successfully');
        await loadStudents();
    } catch (error) {
        console.error('Error deleting student:', error);
        showAlert('Error deleting student', 'error');
    }
}

// Search functionality
function searchStudents() {
    const searchTerm = document.getElementById('searchStudent').value.toLowerCase();
    const rows = document.querySelectorAll('#studentsTable tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Add search event listener
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchStudent');
    if (searchInput) {
        searchInput.addEventListener('input', searchStudents);
    }
    

}); 