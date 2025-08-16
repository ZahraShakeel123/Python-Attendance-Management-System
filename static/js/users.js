// Users management functionality
document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return;
    if (!checkRole(['Admin', 'Teacher'])) return;
    
    await loadUsers();
    setupModalFunctionality();
});

// Modal functionality
function setupModalFunctionality() {
    const modal = document.getElementById('userModal');
    const addUserBtn = document.getElementById('addUserBtn');
    const closeModal = document.querySelector('.close-modal');
    const userForm = document.getElementById('userForm');
    
    // Open modal for adding new user
    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => {
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
    if (userForm) {
        userForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userId = document.getElementById('userId').value;
            if (userId) {
                await updateUser();
            } else {
                await addUser();
            }
            closeModalFunction();
        });
    }
}

function openModal(mode, userData = null) {
    const modal = document.getElementById('userModal');
    const modalTitle = document.getElementById('modalTitle');
    const userForm = document.getElementById('userForm');
    const userIdField = document.getElementById('userId');
    const userFullNameField = document.getElementById('userFullName');
    const userEmailField = document.getElementById('userEmail');
    const userPasswordField = document.getElementById('userPassword');
    const userPhoneField = document.getElementById('userPhone');
    const userCnicField = document.getElementById('userCnic');
    const userDobField = document.getElementById('userDob');
    const userAddressField = document.getElementById('userAddress');
    const userRoleField = document.getElementById('userRole');
    
    if (mode === 'add') {
        modalTitle.textContent = 'Add New User';
        userForm.reset();
        userIdField.value = '';
        userPasswordField.required = true;
        userPasswordField.placeholder = 'Enter password';
    } else if (mode === 'edit' && userData) {
        modalTitle.textContent = 'Edit User';
        userIdField.value = userData.id;
        userFullNameField.value = userData.full_name;
        userEmailField.value = userData.email;
        userPhoneField.value = userData.phone;
        userCnicField.value = userData.cnic;
        userDobField.value = userData.date_of_birth;
        userAddressField.value = userData.address;
        userRoleField.value = userData.role;
        
        // Clear password field for edit mode
        userPasswordField.value = '';
        userPasswordField.required = false;
        userPasswordField.placeholder = 'Leave blank to keep existing password';
        
        // Set gender radio button
        const genderRadios = document.querySelectorAll('input[name="userGender"]');
        genderRadios.forEach(radio => {
            radio.checked = radio.value === userData.gender;
        });
    }
    
    modal.style.display = 'block';
}

function closeModalFunction() {
    const modal = document.getElementById('userModal');
    modal.style.display = 'none';
}

async function loadUsers() {
    try {
        const users = await apiCall('/users');
        
        const usersTable = document.getElementById('usersTable');
        if (usersTable) {
            if (users.length === 0) {
                usersTable.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #666;">No users found</td></tr>';
            } else {
                usersTable.innerHTML = users.map(user => `
                    <tr>
                        <td>${user.full_name}</td>
                        <td>${user.email}</td>
                        <td>${user.role}</td>
                        <td>${user.phone}</td>
                        <td>${user.gender}</td>
                        <td>
                            <button class="btn btn-primary" onclick="editUser(${user.id}, '${user.full_name}', '${user.email}', '${user.phone}', '${user.cnic}', '${user.date_of_birth}', '${user.gender}', '${user.address}', '${user.role}')">Edit</button>
                            <button class="btn btn-secondary" onclick="deleteUser(${user.id})">Delete</button>
                        </td>
                    </tr>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showAlert('Error loading users', 'error');
    }
}

async function addUser() {
    const formData = {
        full_name: document.getElementById('userFullName').value,
        email: document.getElementById('userEmail').value,
        password: document.getElementById('userPassword').value,
        phone: document.getElementById('userPhone').value,
        cnic: document.getElementById('userCnic').value,
        date_of_birth: document.getElementById('userDob').value,
        gender: document.querySelector('input[name="userGender"]:checked')?.value,
        address: document.getElementById('userAddress').value,
        role: document.getElementById('userRole').value
    };
    
    // Validation
    if (!formData.full_name || !formData.email || !formData.password || !formData.phone || 
        !formData.cnic || !formData.date_of_birth || !formData.gender || !formData.address || !formData.role) {
        showAlert('Please fill in all fields', 'warning');
        return;
    }
    
    if (formData.password.length < 6) {
        showAlert('Password must be at least 6 characters long', 'warning');
        return;
    }
    
    try {
        await apiCall('/users', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        showAlert('User added successfully');
        await loadUsers();
    } catch (error) {
        console.error('Error adding user:', error);
        showAlert('Error adding user', 'error');
    }
}

async function editUser(userId, fullName, email, phone, cnic, dateOfBirth, gender, address, role) {
    const userData = {
        id: userId,
        full_name: fullName,
        email: email,
        phone: phone,
        cnic: cnic,
        date_of_birth: dateOfBirth,
        gender: gender,
        address: address,
        role: role
    };
    openModal('edit', userData);
}

async function updateUser() {
    const userId = document.getElementById('userId').value;
    const formData = {
        full_name: document.getElementById('userFullName').value,
        email: document.getElementById('userEmail').value,
        phone: document.getElementById('userPhone').value,
        cnic: document.getElementById('userCnic').value,
        date_of_birth: document.getElementById('userDob').value,
        gender: document.querySelector('input[name="userGender"]:checked')?.value,
        address: document.getElementById('userAddress').value,
        role: document.getElementById('userRole').value
    };
    
    // Check if password is provided (optional for updates)
    const password = document.getElementById('userPassword').value;
    if (password) {
        formData.password = password;
        if (password.length < 6) {
            showAlert('Password must be at least 6 characters long', 'warning');
            return;
        }
    }
    
    // Validation
    if (!formData.full_name || !formData.email || !formData.phone || 
        !formData.cnic || !formData.date_of_birth || !formData.gender || !formData.address || !formData.role) {
        showAlert('Please fill in all required fields', 'warning');
        return;
    }
    
    try {
        await apiCall(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(formData)
        });
        
        showAlert('User updated successfully');
        await loadUsers();
    } catch (error) {
        console.error('Error updating user:', error);
        showAlert('Error updating user', 'error');
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }
    
    try {
        await apiCall(`/users/${userId}`, {
            method: 'DELETE'
        });
        
        showAlert('User deleted successfully');
        await loadUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
        showAlert('Error deleting user', 'error');
    }
}

// Search functionality
function searchUsers() {
    const searchTerm = document.getElementById('searchUser').value.toLowerCase();
    const rows = document.querySelectorAll('#usersTable tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Add search event listener
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchUser');
    if (searchInput) {
        searchInput.addEventListener('input', searchUsers);
    }
}); 