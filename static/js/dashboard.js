// Dashboard functionality
console.log('=== DASHBOARD.JS SCRIPT LOADED ===');

document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== DASHBOARD.JS DOM LOADED ===');
    console.log('checkAuth function exists:', typeof checkAuth);
    
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    console.log('Token in localStorage:', token ? 'EXISTS' : 'NULL');
    
    if (!token) {
        console.log('No token found, redirecting to login...');
        window.location.href = '/login';
        return;
    }
    
    console.log('checkAuth() result:', checkAuth());
    console.log('currentUser before init:', currentUser);
    
    if (!checkAuth()) {
        console.log('Authentication failed, redirecting...');
        return;
    }
    
    // Ensure current user is initialized
    if (!currentUser) {
        console.log('Initializing current user...');
        if (!initializeCurrentUser()) {
            console.log('Failed to initialize user, redirecting...');
            redirectToLogin();
            return;
        }
    }
    
    console.log('Current user after init:', currentUser);
    console.log('Starting to load dashboard data...');
    
    await loadDashboardStats();
    await loadRecentAttendance();
    
    console.log('=== DASHBOARD.JS COMPLETED ===');
});

async function loadDashboardStats() {
    try {
        console.log('Loading dashboard stats...');
        const stats = await apiCall('/dashboard/stats');
        console.log('Dashboard stats loaded:', stats);
        
        const statsGrid = document.getElementById('statsGrid');
        if (statsGrid) {
            // Check if current user is a student
            const isStudent = currentUser && currentUser.role === 'Student';
            
            // Show the same interface for all users (admin/teacher/student)
            statsGrid.innerHTML = `
                <div class="stat-card">
                    <h3>${stats.total_classes}</h3>
                    <p>Total Classes</p>
                </div>
                <div class="stat-card">
                    <h3>${stats.total_students}</h3>
                    <p>Total Students</p>
                </div>
                <div class="stat-card">
                    <h3>${stats.total_users}</h3>
                    <p>Total Users</p>
                </div>
            `;
            console.log('Stats displayed in dashboard');
        } else {
            console.error('statsGrid element not found');
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showAlert('Error loading dashboard statistics: ' + error.message, 'error');
    }
}

async function loadRecentAttendance() {
    try {
        console.log('=== LOADING RECENT ATTENDANCE ===');
        console.log('Current user:', currentUser);
        
        // Get recent attendance from dashboard stats for all users
        const stats = await apiCall('/dashboard/stats');
        const attendance = stats.recent_attendance || [];
        console.log('Recent attendance from stats:', attendance);
        
        console.log('Attendance data received:', attendance);
        console.log('Attendance data type:', typeof attendance);
        console.log('Attendance data length:', attendance ? attendance.length : 'null');
        
        const recentAttendance = document.getElementById('recentAttendance');
        console.log('recentAttendance element found:', !!recentAttendance);
        
        if (recentAttendance) {
            // Get only the last 10 attendance records
            const recentRecords = attendance.slice(0, 10);
            console.log('Recent records to display:', recentRecords);
            console.log('Recent records length:', recentRecords.length);
            
            if (recentRecords.length === 0) {
                // Show a more informative message for students
                const message = currentUser && currentUser.role === 'Student' 
                    ? 'No attendance records found for your class yet. Class attendance will appear here once marked by your teacher.'
                    : 'No recent attendance records';
                recentAttendance.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #666;">${message}</td></tr>`;
                console.log('Showing no records message:', message);
            } else {
                console.log('Rendering attendance records...');
                const htmlContent = recentRecords.map(record => `
                    <tr>
                        <td>${record.student_name}</td>
                        <td>${record.registration_number}</td>
                        <td>${record.class_name}</td>
                        <td>${record.date}</td>
                        <td>
                            <span class="status-badge ${record.status === 'present' ? 'present' : record.status === 'absent' ? 'absent' : 'not-marked'}">
                                ${record.status}
                            </span>
                        </td>
                    </tr>
                `).join('');
                console.log('Generated HTML:', htmlContent);
                recentAttendance.innerHTML = htmlContent;
                console.log('Attendance records rendered successfully');
            }
        } else {
            console.error('recentAttendance element not found');
        }
    } catch (error) {
        console.error('Error loading recent attendance:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        // Don't show error alert, just log it
        console.log('Attendance loading failed, but continuing...');
    }
}

// Add status badge styles
const style = document.createElement('style');
style.textContent = `
    .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .status-badge.present {
        background: #d4edda;
        color: #155724;
    }
    
    .status-badge.absent {
        background: #f8d7da;
        color: #721c24;
    }
    
    .status-badge.not-marked {
        background: #f8f9fa;
        color: #6c757d;
        border: 1px solid #dee2e6;
    }
`;
document.head.appendChild(style); 