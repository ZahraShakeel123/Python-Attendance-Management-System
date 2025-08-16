// Global variables
console.log('=== AUTH.JS STARTING ===');
let currentUser = null;
const API_BASE_URL = 'http://127.0.0.1:8080/api';
console.log('=== AUTH.JS VARIABLES SET ===');
console.log('=== AUTH.JS SCRIPT LOADED SUCCESSFULLY ===');

// Check if user is already logged in and redirect to dashboard
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== AUTH.JS DOM LOADED ===');
    const token = getToken();
    console.log('Token check on page load:', token ? 'EXISTS' : 'NULL');
    
    // If we're on the login page and user is already logged in, redirect to dashboard
    if (window.location.pathname === '/login' && token) {
        console.log('User already logged in, redirecting to dashboard...');
        window.location.href = '/dashboard';
        return;
    }
    
    // If we're on the register page and user is already logged in, redirect to dashboard
    if (window.location.pathname === '/register' && token) {
        console.log('User already logged in, redirecting to dashboard...');
        window.location.href = '/dashboard';
        return;
    }
    
    // If we're on the index page and user is already logged in, redirect to dashboard
    if (window.location.pathname === '/' && token) {
        console.log('User already logged in, redirecting to dashboard...');
        window.location.href = '/dashboard';
        return;
    }
});



// Utility functions
function showAlert(message, type = 'success') {
    const alertDiv = document.getElementById('alertMessage');
    if (alertDiv) {
        alertDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
        setTimeout(() => {
            alertDiv.innerHTML = '';
        }, 5000);
    }
}

function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function removeToken() {
    localStorage.removeItem('token');
}

function isAuthenticated() {
    return getToken() !== null;
}

function redirectToLogin() {
    window.location.href = '/login';
}

// Decode JWT token to get user information
function decodeToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decoded = JSON.parse(jsonPayload);
        return decoded;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

// Initialize current user from token
function initializeCurrentUser() {
    const token = getToken();
    if (token) {
        const payload = decodeToken(token);
        if (payload) {
            currentUser = {
                id: payload.user_id,
                email: payload.email,
                role: payload.role,
                full_name: payload.full_name || 'User' // Use fallback if full_name not in token
            };
            console.log('User initialized from token:', currentUser);
            return true;
        } else {
            console.log('Failed to decode token payload');
        }
    } else {
        console.log('No token found in localStorage');
    }
    return false;
}

// API functions
async function apiCall(endpoint, options = {}) {
    const token = getToken();
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log('Making API call to:', fullUrl);

    try {
        const response = await fetch(fullUrl, {
            ...defaultOptions,
            ...options
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            const errorMessage = data.error || 'An error occurred';
            console.error('API Error Response:', errorMessage);
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Login functionality
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            setToken(data.token);
            currentUser = data.user;
            console.log('Login successful, user set:', currentUser);
            console.log('Token stored:', data.token ? 'YES' : 'NO');
            console.log('Token value:', data.token ? data.token.substring(0, 20) + '...' : 'NULL');
            console.log('localStorage token check:', getToken() ? 'STORED' : 'NOT STORED');
            
            showAlert('Login successful!');
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } catch (error) {
            showAlert(error.message, 'error');
        }
    });


}

// Registration functionality
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            full_name: document.getElementById('full_name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            confirm_password: document.getElementById('confirm_password').value,
            phone: document.getElementById('phone').value,
            cnic: document.getElementById('cnic').value,
            date_of_birth: document.getElementById('date_of_birth').value,
            gender: document.querySelector('input[name="gender"]:checked')?.value,
            address: document.getElementById('address').value,
            role: document.getElementById('role').value
        };

        // Validation
        if (formData.password !== formData.confirm_password) {
            showAlert('Passwords do not match', 'error');
            return;
        }

        if (formData.password.length < 6) {
            showAlert('Password must be at least 6 characters long', 'error');
            return;
        }

        if (!formData.gender) {
            showAlert('Please select a gender', 'error');
            return;
        }

        if (!formData.role) {
            showAlert('Please select a role', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }
            
            showAlert('Registration successful! Please login.');
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } catch (error) {
            showAlert(error.message, 'error');
        }
    });
}

// Logout functionality
if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        removeToken();
        currentUser = null;
        window.location.href = '/';
    });
}

// Check authentication on protected pages
function checkAuth() {
    console.log('=== CHECKING AUTH ===');
    console.log('isAuthenticated():', isAuthenticated());
    console.log('getToken():', getToken() ? 'EXISTS' : 'NULL');
    
    if (!isAuthenticated()) {
        console.log('Not authenticated, redirecting to login...');
        redirectToLogin();
        return false;
    }
    console.log('Authentication successful');
    return true;
}

// Role-based access control
function checkRole(allowedRoles) {
    if (!currentUser) {
        if (!initializeCurrentUser()) {
            redirectToLogin();
            return false;
        }
    }

    console.log('Checking role for user:', currentUser, 'Allowed roles:', allowedRoles);
    if (!allowedRoles.includes(currentUser.role)) {
        showAlert('Access denied. Insufficient permissions.', 'error');
        return false;
    }

    return true;
}

// Initialize role-based UI elements
function initializeRoleBasedUI() {
    if (!checkAuth()) return;

    // Initialize current user if not already set
    if (!currentUser) {
        if (!initializeCurrentUser()) {
            redirectToLogin();
            return;
        }
    }

    console.log('Current user:', currentUser);
    const isAdmin = currentUser && ['Admin', 'Teacher'].includes(currentUser.role);
    console.log('Is admin:', isAdmin);
    
    // Hide admin-only elements for students
    const adminElements = document.querySelectorAll('#classLink, #studentLink, #userLink');
    console.log('Admin elements found:', adminElements.length);
    adminElements.forEach(element => {
        console.log('Element:', element.id, 'Display:', element.style.display);
        if (!isAdmin) {
            element.style.display = 'none';
            console.log('Hiding element:', element.id);
        } else {
            element.style.display = 'block';
            console.log('Showing element:', element.id);
        }
    });
}

// Global debug function for testing
window.debugAuth = function() {
    console.log('=== AUTH DEBUG ===');
    console.log('Token exists:', !!getToken());
    console.log('Token value:', getToken());
    console.log('Current user:', currentUser);
    console.log('Is authenticated:', isAuthenticated());
    
    if (currentUser) {
        console.log('User role:', currentUser.role);
        console.log('Is admin/teacher:', ['Admin', 'Teacher'].includes(currentUser.role));
    }
    
    const adminElements = document.querySelectorAll('#classLink, #studentLink, #userLink');
    console.log('Admin elements found:', adminElements.length);
    adminElements.forEach(el => {
        console.log(`Element ${el.id}:`, el.style.display);
    });
    
    // Test role-based UI
    initializeRoleBasedUI();
    console.log('=== END DEBUG ===');
};

// Test token storage
window.testTokenStorage = function() {
    console.log('=== TOKEN STORAGE TEST ===');
    const testToken = 'test.token.here';
    setToken(testToken);
    console.log('Token set:', testToken);
    console.log('Token retrieved:', getToken());
    console.log('Token matches:', getToken() === testToken);
    removeToken();
    console.log('Token removed, now:', getToken());
    console.log('=== END TOKEN TEST ===');
};

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== PERSISTENT LOGIN DEBUG ===');
    console.log('Page loaded, checking persistent login...');
    console.log('Current pathname:', window.location.pathname);
    console.log('Current URL:', window.location.href);
    console.log('Token exists:', !!getToken());
    
    // Initialize current user from token if available
    if (initializeCurrentUser()) {
        console.log('✅ User initialized from token:', currentUser);
        
        // If user is authenticated and on login/register page, redirect to dashboard
        const currentPath = window.location.pathname;
        const shouldRedirect = currentPath === '/login' || currentPath === '/login.html' || 
                             currentPath === '/register' || currentPath === '/register.html' ||
                             currentPath === '/' || currentPath === '/index.html';
        
        console.log('Should redirect:', shouldRedirect);
        console.log('Current path matches redirect conditions:', shouldRedirect);
        
        if (shouldRedirect) {
            console.log('🔄 Redirecting authenticated user to dashboard...');
            window.location.href = '/dashboard';
            return;
        }
    } else {
        console.log('❌ No valid token found or failed to initialize user');
        console.log('Token value:', getToken());
        if (getToken()) {
            console.log('Token exists but failed to decode');
        }
    }

    // Only check auth on protected pages
    if (!["/login", "/register", "/"].includes(window.location.pathname)) {
        console.log('On protected page, initializing role-based UI...');
        // Add a small delay to ensure everything is loaded
        setTimeout(() => {
            initializeRoleBasedUI();
        }, 100);
    }
    
    console.log('=== END PERSISTENT LOGIN DEBUG ===');
});

// Also run immediately if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
} else {
    // DOM is already loaded, run immediately
    console.log('DOM already loaded, running persistent login check immediately...');
    if (initializeCurrentUser()) {
        const currentPath = window.location.pathname;
        const shouldRedirect = currentPath === '/login' || currentPath === '/login.html' || 
                             currentPath === '/register' || currentPath === '/register.html' ||
                             currentPath === '/' || currentPath === '/index.html';
        
        if (shouldRedirect) {
            console.log('🔄 Immediate redirect to dashboard...');
            window.location.href = '/dashboard';
        }
    }
} 