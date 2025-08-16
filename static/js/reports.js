// Reports functionality
document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return;
    
    await loadClasses();
    await loadStudents();
    setupReportTypeHandling();
    await loadReports();
});

function setupReportTypeHandling() {
    const reportTypeSelect = document.getElementById('reportType');
    const classFilter = document.getElementById('classFilter');
    const studentFilter = document.getElementById('studentFilter');
    
    if (reportTypeSelect) {
        reportTypeSelect.addEventListener('change', (e) => {
            const reportType = e.target.value;
            
            // Hide both filters initially
            classFilter.style.display = 'none';
            studentFilter.style.display = 'none';
            
            // Show appropriate filter based on report type
            if (reportType === 'class-wise') {
                classFilter.style.display = 'block';
            } else if (reportType === 'student-wise') {
                studentFilter.style.display = 'block';
            }
        });
    }
}

async function loadClasses() {
    try {
        // Use the new report-specific endpoint that's accessible to all users
        const classes = await apiCall('/report/classes');
        
        const classSelect = document.getElementById('classSelect');
        if (classSelect) {
            classSelect.innerHTML = '<option value="">All Classes</option>';
            classes.forEach(cls => {
                classSelect.innerHTML += `<option value="${cls.id}">${cls.name}</option>`;
            });
        }
    } catch (error) {
        console.error('Error loading classes:', error);
        showAlert('Error loading classes', 'error');
    }
}

async function loadStudents() {
    try {
        // Use the new report-specific endpoint that's accessible to all users
        const students = await apiCall('/report/students');
        
        const studentSelect = document.getElementById('studentSelect');
        if (studentSelect) {
            studentSelect.innerHTML = '<option value="">Select Student</option>';
            students.forEach(student => {
                studentSelect.innerHTML += `<option value="${student.id}">${student.name} (${student.registration_number}) - ${student.class_name}</option>`;
            });
        }
    } catch (error) {
        console.error('Error loading students:', error);
        showAlert('Error loading students', 'error');
    }
}

async function loadReports() {
    try {
        const reportType = document.getElementById('reportType')?.value || 'class-wise';
        const classId = document.getElementById('classSelect')?.value || '';
        const studentId = document.getElementById('studentSelect')?.value || '';
        const startDate = document.getElementById('startDate')?.value || '';
        const endDate = document.getElementById('endDate')?.value || '';
        
        console.log('Generating report with:', { reportType, classId, studentId, startDate, endDate });
        
        // Validate required fields based on report type
        if (reportType === 'class-wise' && !classId) {
            showAlert('Please select a class for class-wise report', 'warning');
            return;
        }
        if (reportType === 'student-wise' && !studentId) {
            showAlert('Please select a student for student-wise report', 'warning');
            return;
        }
        
        // Build URL with proper parameters
        let url = '/reports?';
        const params = [];
        
        if (reportType === 'class-wise' && classId) {
            params.push(`class_id=${classId}`);
        } else if (reportType === 'student-wise' && studentId) {
            params.push(`student_id=${studentId}`);
        }
        if (startDate) params.push(`start_date=${startDate}`);
        if (endDate) params.push(`end_date=${endDate}`);
        
        url += params.join('&');
        console.log('API URL:', url);
        
        const reports = await apiCall(url);
        console.log('Reports received:', reports);
        
        const reportData = document.getElementById('reportData');
        if (reportData) {
            if (!reports || reports.length === 0) {
                reportData.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #666;">No reports found for the selected criteria</td></tr>';
                showAlert('No attendance records found for the selected criteria', 'warning');
            } else {
                reportData.innerHTML = reports.map(report => `
                    <tr>
                        <td>${report.student_name}</td>
                        <td>${report.registration_number}</td>
                        <td>${report.class_name}</td>
                        <td>${report.date}</td>
                        <td>
                            <span class="status-badge ${report.status === 'present' ? 'present' : 'absent'}">
                                ${report.status}
                            </span>
                        </td>
                    </tr>
                `).join('');
                
                // Show success message
                const reportTypeText = reportType === 'class-wise' ? 'Class-wise' : 'Student-wise';
                showAlert(`${reportTypeText} report generated successfully with ${reports.length} records`, 'success');
            }
        }
        
        // Update summary
        updateReportSummary(reports);
        
        // Store report data for printing
        window.currentReportData = {
            type: reportType,
            data: reports,
            filters: { classId, studentId, startDate, endDate }
        };
    } catch (error) {
        console.error('Error loading reports:', error);
        // Only show error if it's a real API error, not just empty data
        if (error.message && !error.message.includes('No reports found')) {
            showAlert('Error generating report: ' + error.message, 'error');
        }
    }
}

function updateReportSummary(reports) {
    const totalRecords = reports.length;
    const presentCount = reports.filter(r => r.status === 'present').length;
    const absentCount = reports.filter(r => r.status === 'absent').length;
    const attendanceRate = totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(1) : 0;
    
    const reportSummary = document.getElementById('reportSummary');
    if (reportSummary) {
        reportSummary.style.display = 'block';
        document.getElementById('totalPresent').textContent = presentCount;
        document.getElementById('totalAbsent').textContent = absentCount;
        document.getElementById('attendancePercentage').textContent = `${attendanceRate}%`;
    }
}

// Event listeners for filter changes
document.addEventListener('DOMContentLoaded', () => {
    const generateReportBtn = document.getElementById('generateReport');
    const printReportBtn = document.getElementById('printReport');
    
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', loadReports);
    }
    
    if (printReportBtn) {
        printReportBtn.addEventListener('click', printReport);
    }
    
    // Set default dates
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (startDateInput) {
        startDateInput.value = lastMonth.toISOString().split('T')[0];
    }
    if (endDateInput) {
        endDateInput.value = today.toISOString().split('T')[0];
    }
});

function exportReport() {
    const table = document.getElementById('reportTable');
    if (!table) return;
    
    let csv = 'Student Name,Registration Number,Class,Date,Status\n';
    
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length > 0) {
            const rowData = Array.from(cells).map(cell => {
                // Remove HTML tags and get text content
                return `"${cell.textContent.trim()}"`;
            });
            csv += rowData.join(',') + '\n';
        }
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showAlert('Report exported successfully');
}

function printReport() {
    if (!window.currentReportData) {
        showAlert('Please generate a report first', 'warning');
        return;
    }
    
    const { type, data, filters } = window.currentReportData;
    
    // Create print window
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (type === 'class-wise') {
        printClassWiseReport(printWindow, data, filters);
    } else if (type === 'student-wise') {
        printStudentWiseReport(printWindow, data, filters);
    }
}

function printClassWiseReport(printWindow, data, filters) {
    // Group data by student
    const studentStats = {};
    data.forEach(record => {
        if (!studentStats[record.student_id]) {
            studentStats[record.student_id] = {
                name: record.student_name,
                registration_number: record.registration_number,
                class_name: record.class_name,
                present_count: 0,
                absent_count: 0,
                absent_dates: []
            };
        }
        
        if (record.status === 'present') {
            studentStats[record.student_id].present_count++;
        } else {
            studentStats[record.student_id].absent_count++;
            studentStats[record.student_id].absent_dates.push(record.date);
        }
    });
    
    const classSelect = document.getElementById('classSelect');
    const selectedClass = classSelect.options[classSelect.selectedIndex]?.text || 'All Classes';
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Class Attendance Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .header h1 { color: #808000; margin-bottom: 10px; }
                .report-info { margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background-color: #808000; color: white; font-weight: bold; }
                tr:nth-child(even) { background-color: #f9f9f9; }
                .percentage { font-weight: bold; }
                .absent-dates { font-size: 0.9em; color: #666; }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Class Attendance Report</h1>
                <p><strong>Class:</strong> ${selectedClass}</p>
                <p><strong>Period:</strong> ${filters.startDate} to ${filters.endDate}</p>
                <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Student Name</th>
                        <th>Registration No</th>
                        <th>Present Count</th>
                        <th>Absent Count</th>
                        <th>Present %</th>
                        <th>Absent %</th>
                        <th>Absent Dates</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.values(studentStats).map(student => {
                        const total = student.present_count + student.absent_count;
                        const presentPercentage = total > 0 ? ((student.present_count / total) * 100).toFixed(1) : 0;
                        const absentPercentage = total > 0 ? ((student.absent_count / total) * 100).toFixed(1) : 0;
                        
                        return `
                            <tr>
                                <td>${student.name}</td>
                                <td>${student.registration_number}</td>
                                <td>${student.present_count}</td>
                                <td>${student.absent_count}</td>
                                <td class="percentage">${presentPercentage}%</td>
                                <td class="percentage">${absentPercentage}%</td>
                                <td class="absent-dates">${student.absent_dates.join(', ')}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            
            <div class="no-print" style="margin-top: 30px; text-align: center;">
                <button onclick="window.print()">Print Report</button>
                <button onclick="window.close()">Close</button>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}

function printStudentWiseReport(printWindow, data, filters) {
    if (data.length === 0) {
        printWindow.document.write('<p>No data available for the selected student.</p>');
        printWindow.document.close();
        return;
    }
    
    const student = data[0];
    const presentCount = data.filter(r => r.status === 'present').length;
    const absentCount = data.filter(r => r.status === 'absent').length;
    const total = presentCount + absentCount;
    const presentPercentage = total > 0 ? ((presentCount / total) * 100).toFixed(1) : 0;
    const absentPercentage = total > 0 ? ((absentCount / total) * 100).toFixed(1) : 0;
    
    const absentDates = data.filter(r => r.status === 'absent').map(r => r.date);
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Student Attendance Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .header h1 { color: #808000; margin-bottom: 10px; }
                .student-info { margin-bottom: 20px; }
                .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
                .stat-card { border: 1px solid #ddd; padding: 15px; text-align: center; }
                .stat-value { font-size: 2em; font-weight: bold; color: #808000; }
                .stat-label { color: #666; margin-top: 5px; }
                .absent-dates { margin-top: 20px; }
                .absent-dates h3 { color: #808000; }
                .date-list { display: flex; flex-wrap: wrap; gap: 10px; }
                .date-item { background: #f0f0f0; padding: 5px 10px; border-radius: 5px; }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Student Attendance Report</h1>
            </div>
            
            <div class="student-info">
                <h2>${student.student_name}</h2>
                <p><strong>Registration No:</strong> ${student.registration_number}</p>
                <p><strong>Class:</strong> ${student.class_name}</p>
                <p><strong>Period:</strong> ${filters.startDate} to ${filters.endDate}</p>
                <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${presentCount}</div>
                    <div class="stat-label">Present Count</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${absentCount}</div>
                    <div class="stat-label">Absent Count</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${presentPercentage}%</div>
                    <div class="stat-label">Present Percentage</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${absentPercentage}%</div>
                    <div class="stat-label">Absent Percentage</div>
                </div>
            </div>
            
            <div class="absent-dates">
                <h3>Absent Dates:</h3>
                <div class="date-list">
                    ${absentDates.length > 0 ? 
                        absentDates.map(date => `<span class="date-item">${date}</span>`).join('') :
                        '<span class="date-item">No absences recorded</span>'
                    }
                </div>
            </div>
            
            <div class="no-print" style="margin-top: 30px; text-align: center;">
                <button onclick="window.print()">Print Report</button>
                <button onclick="window.close()">Close</button>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
} 