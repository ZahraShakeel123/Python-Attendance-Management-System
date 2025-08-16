// Attendance functionality
document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== ATTENDANCE.JS DOM LOADED ===');
    
    if (!checkAuth()) {
        console.log('Authentication failed');
        return;
    }
    
    console.log('Authentication successful, loading data...');
    
    try {
        await loadClasses();
        console.log('Classes loaded successfully');
    } catch (error) {
        console.error('Error loading classes:', error);
    }
    
    try {
        await loadTodayAttendance();
        console.log('Today\'s attendance loaded successfully');
    } catch (error) {
        console.error('Error loading today\'s attendance:', error);
    }
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendanceDate').value = today;
    console.log('Default date set to:', today);
});

async function loadClasses() {
    try {
        const classes = await apiCall('/attendance/classes');
        
        const classSelect = document.getElementById('classSelect');
        if (classSelect) {
            classSelect.innerHTML = '<option value="">Select a class</option>';
            classes.forEach(cls => {
                classSelect.innerHTML += `<option value="${cls.id}">${cls.name}</option>`;
            });
        }
    } catch (error) {
        console.error('Error loading classes:', error);
        showAlert('Error loading classes', 'error');
    }
}

async function loadClassStudents(classId) {
    try {
        const students = await apiCall(`/attendance/class/${classId}`);
        const selectedDate = document.getElementById('attendanceDate')?.value || new Date().toISOString().split('T')[0];
        
        const attendanceGrid = document.getElementById('attendanceGrid');
        const studentsList = document.getElementById('studentsList');
        
        if (studentsList && attendanceGrid) {
            studentsList.style.display = 'block';
            
            // Check if user is admin/teacher or student
            const isAdmin = currentUser && ['Admin', 'Teacher'].includes(currentUser.role);
            
            // Load attendance data for the selected date and class
            let attendanceData = [];
            try {
                console.log('Loading attendance for date:', selectedDate, 'class:', classId);
                
                if (isAdmin) {
                    // For admin/teacher, get all attendance for the selected date and class
                    const attendanceResponse = await apiCall('/attendance');
                    console.log('All attendance records:', attendanceResponse);
                    console.log('Filtering for date:', selectedDate, 'class:', classId);
                    
                    // Filter by exact date and class
                    attendanceData = attendanceResponse.filter(record => {
                        const recordDate = record.date;
                        const recordClassId = parseInt(record.class_id);
                        const selectedClassId = parseInt(classId);
                        
                        console.log(`Record: date=${recordDate}, class_id=${recordClassId}, matches: ${recordDate === selectedDate && recordClassId === selectedClassId}`);
                        
                        return recordDate === selectedDate && recordClassId === selectedClassId;
                    });
                    
                    console.log('Filtered attendance for admin:', attendanceData);
                } else {
                    // For students, get all attendance for the selected class and date
                    try {
                        const attendanceResponse = await apiCall('/attendance');
                        console.log('All attendance records:', attendanceResponse);
                        console.log('Filtering for date:', selectedDate, 'class:', classId);
                        
                        // Filter by exact date and class
                        attendanceData = attendanceResponse.filter(record => {
                            const recordDate = record.date;
                            const recordClassId = parseInt(record.class_id);
                            const selectedClassId = parseInt(classId);
                            
                            console.log(`Record: date=${recordDate}, class_id=${recordClassId}, matches: ${recordDate === selectedDate && recordClassId === selectedClassId}`);
                            
                            return recordDate === selectedDate && recordClassId === selectedClassId;
                        });
                        
                        console.log('Filtered attendance for selected class and date:', attendanceData);
                    } catch (error) {
                        console.log('No attendance data available for student on this date:', error);
                        attendanceData = [];
                    }
                }
            } catch (error) {
                console.log('No attendance data available for this date:', error);
            }
            
            // Create table format
            attendanceGrid.innerHTML = `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Registration Number</th>
                            <th>Gender</th>
                            ${isAdmin ? '<th>Present</th><th>Absent</th>' : '<th>Status</th>'}
                        </tr>
                    </thead>
                    <tbody>
                        ${isAdmin ? 
                            // For admin/teacher, show all students
                            students.map(student => {
                                // Find attendance record for this student and date
                                const attendanceRecord = attendanceData.find(record => 
                                    record.student_id === student.id
                                );
                                console.log(`Student ${student.name} (ID: ${student.id}) - Attendance record:`, attendanceRecord);
                                
                                return `
                                    <tr>
                                        <td>${student.name}</td>
                                        <td>${student.registration_number}</td>
                                        <td>${student.gender}</td>
                                        <td>
                                            <input type="radio" name="attendance_${student.id}" value="present" 
                                                   ${attendanceRecord?.status === 'present' ? 'checked' : ''}
                                                   onchange="markAttendance(${student.id}, 'present')">
                                        </td>
                                        <td>
                                            <input type="radio" name="attendance_${student.id}" value="absent" 
                                                   ${attendanceRecord?.status === 'absent' ? 'checked' : ''}
                                                   onchange="markAttendance(${student.id}, 'absent')">
                                        </td>
                                    </tr>
                                `;
                            }).join('')
                        : 
                            // For students, show all students in the class with their status
                            students.map(student => {
                                // Find attendance record for this student and date
                                const attendanceRecord = attendanceData.find(record => 
                                    record.student_id === student.id
                                );
                                console.log(`Student ${student.name} (ID: ${student.id}) - Attendance record:`, attendanceRecord);
                                
                                return `
                                    <tr>
                                        <td>${student.name}</td>
                                        <td>${student.registration_number}</td>
                                        <td>${student.gender}</td>
                                        <td>
                                            <span class="status-badge ${attendanceRecord?.status === 'present' ? 'present' : attendanceRecord?.status === 'absent' ? 'absent' : 'not-marked'}">
                                                ${attendanceRecord ? (attendanceRecord.status === 'Not Marked' ? 'Not Marked' : attendanceRecord.status) : 'Not Marked'}
                                            </span>
                                        </td>
                                    </tr>
                                `;
                            }).join('')
                        }
                    </tbody>
                </table>
            `;
            
            // Hide save button for students
            const saveButton = document.getElementById('saveAttendance');
            if (saveButton) {
                saveButton.style.display = isAdmin ? 'block' : 'none';
            }
            
            // Show appropriate message for students
            if (!isAdmin) {
                showAlert('You can view attendance records but cannot mark attendance', 'info');
            }
        }
    } catch (error) {
        console.error('Error loading students:', error);
        showAlert('Error loading students', 'error');
    }
}

async function markAttendance(studentId, status) {
    try {
        // Check if user has permission to mark attendance
        const isAdmin = currentUser && ['Admin', 'Teacher'].includes(currentUser.role);
        if (!isAdmin) {
            showAlert('You do not have permission to mark attendance', 'error');
            return;
        }
        
        const classId = document.getElementById('classSelect').value;
        const date = document.getElementById('attendanceDate').value;
        
        if (!classId || !date) {
            showAlert('Please select a class and date', 'warning');
            return;
        }
        
        await apiCall('/attendance', {
            method: 'POST',
            body: JSON.stringify({
                student_id: studentId,
                class_id: classId,
                date: date,
                status: status
            })
        });
        
        showAlert(`Attendance marked as ${status} successfully`);
        
        // Update radio button appearance
        const radioButtons = document.querySelectorAll(`input[name="attendance_${studentId}"]`);
        radioButtons.forEach(radio => {
            radio.checked = radio.value === status;
        });
        
        // Reload today's attendance
        await loadTodayAttendance();
    } catch (error) {
        console.error('Error marking attendance:', error);
        showAlert('Error marking attendance', 'error');
    }
}

async function loadTodayAttendance() {
    try {
        console.log('Loading today\'s attendance...');
        
        const isAdmin = currentUser && ['Admin', 'Teacher'].includes(currentUser.role);
        let attendance;
        
        if (isAdmin) {
            // For admin/teacher, get all today's attendance
            attendance = await apiCall('/attendance');
            const today = new Date().toISOString().split('T')[0];
            attendance = attendance.filter(record => record.date === today);
        } else {
            // For students, get all today's attendance for their class
            try {
                const allAttendance = await apiCall('/attendance');
                const today = new Date().toISOString().split('T')[0];
                console.log('All attendance for student class view:', allAttendance);
                attendance = allAttendance.filter(record => record.date === today);
                console.log('Today\'s attendance for student class view:', attendance);
            } catch (error) {
                console.log('No today\'s attendance found for student class:', error);
                attendance = [];
            }
        }
        
        console.log('Attendance data received:', attendance);
        
        const todayAttendance = document.getElementById('todayAttendance');
        if (todayAttendance) {
            if (attendance.length === 0) {
                const message = isAdmin ? 'No attendance records for today' : 'No attendance marked for you today';
                todayAttendance.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #666;">${message}</td></tr>`;
                console.log('No records found for today');
            } else {
                const htmlContent = attendance.map(record => `
                    <tr>
                        <td>${record.student_name}</td>
                        <td>${record.registration_number}</td>
                        <td>${record.class_name}</td>
                        <td>
                            <span class="status-badge ${record.status === 'present' ? 'present' : record.status === 'absent' ? 'absent' : 'not-marked'}">
                                ${record.status === 'Not Marked' ? 'Not Marked' : record.status}
                            </span>
                        </td>
                        <td>${record.marked_by || 'Not marked'}</td>
                    </tr>
                `).join('');
                todayAttendance.innerHTML = htmlContent;
                console.log('Today\'s attendance HTML:', htmlContent);
            }
        } else {
            console.error('todayAttendance element not found');
        }
    } catch (error) {
        console.error('Error loading today\'s attendance:', error);
        showAlert('Error loading today\'s attendance', 'error');
    }
}

// Event listeners
if (document.getElementById('classSelect')) {
    document.getElementById('classSelect').addEventListener('change', (e) => {
        const classId = e.target.value;
        if (classId) {
            loadClassStudents(classId);
        } else {
            document.getElementById('studentsList').style.display = 'none';
        }
    });
}

// Add date change listener for students to view attendance for different dates
if (document.getElementById('attendanceDate')) {
    document.getElementById('attendanceDate').addEventListener('change', (e) => {
        const classId = document.getElementById('classSelect').value;
        if (classId) {
            loadClassStudents(classId);
        }
    });
}

if (document.getElementById('saveAttendance')) {
    document.getElementById('saveAttendance').addEventListener('click', async () => {
        const classId = document.getElementById('classSelect').value;
        const date = document.getElementById('attendanceDate').value;
        
        if (!classId || !date) {
            showAlert('Please select a class and date', 'warning');
            return;
        }
        
        showAlert('Attendance saved successfully!');
        await loadTodayAttendance();
    });
}

// Add active button styles
const style = document.createElement('style');
style.textContent = `
    .btn.active {
        transform: scale(0.95);
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .btn-present.active {
        background: linear-gradient(135deg, #20c997, #17a2b8);
    }
    
    .btn-absent.active {
        background: linear-gradient(135deg, #c82333, #bd2130);
    }
    
    .status-badge.not-marked {
        background: #f8f9fa;
        color: #6c757d;
        border: 1px solid #dee2e6;
    }
`;
document.head.appendChild(style); 