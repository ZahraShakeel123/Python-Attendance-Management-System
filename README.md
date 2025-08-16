# 🎓 Attendance Management System

A comprehensive web-based attendance management system built with **Flask**, **PostgreSQL**, and modern **HTML/CSS/JavaScript**. This system provides role-based access control for administrators, teachers, and students with a beautiful, responsive interface.

## ✨ Features

### 🔐 **Authentication & User Management**
- **Multi-role Authentication**: Admin, Teacher, and Student roles
- **JWT Token Security**: Secure authentication with JSON Web Tokens
- **User Registration**: Complete user registration with validation
- **Password Reset**: Email-based password reset functionality
- **Session Management**: Persistent login sessions

### 👥 **Role-Based Access Control**
- **Admin**: Full system access - manage users, classes, students, attendance, reports
- **Teacher**: Mark attendance, view reports, manage classes and students
- **Student**: View personal attendance, class attendance, and dashboard

### 🏫 **Class Management**
- **Add/Edit/Delete Classes**: Complete class management
- **Student Count Tracking**: Male and female student counts
- **Class Search**: Search and filter classes
- **Class Statistics**: View class-wise attendance statistics

### 👨‍🎓 **Student Management**
- **Add/Edit/Delete Students**: Complete student management
- **Registration Numbers**: Unique registration number system
- **Class Assignment**: Assign students to classes
- **Student Search**: Search and filter students
- **Gender Tracking**: Male/female student tracking

### 📊 **Attendance Management**
- **Mark Attendance**: Present/Absent status marking
- **Date-wise Tracking**: Track attendance by specific dates
- **Class-wise View**: View attendance for entire classes
- **Student Dashboard**: Students can view their attendance history
- **Today's Attendance**: Real-time today's attendance status
- **Recent Attendance**: Show recent attendance records for all users

### 📈 **Reports & Analytics**
- **Attendance Reports**: Generate comprehensive attendance reports
- **Date Range Filtering**: Filter reports by date ranges
- **Class-wise Reports**: Generate reports for specific classes
- **Export Functionality**: Export reports to CSV format
- **Print Support**: Print attendance reports

### 🎨 **User Interface**
- **Modern Design**: Olive green (#808000) and sand beige (#F5F5DC) color scheme
- **Responsive Layout**: Works on desktop and mobile devices
- **Neumorphic Style**: Soft, rounded buttons with shadows
- **Real-time Clock**: Current date and time display
- **Interactive Tables**: Searchable and sortable data tables
- **Status Badges**: Visual attendance status indicators

## 🛠️ Technology Stack

### **Backend**
- **Python 3.8+**: Core programming language
- **Flask**: Web framework for API and routing
- **SQLAlchemy**: ORM for database operations
- **PostgreSQL**: Primary database
- **JWT**: JSON Web Tokens for authentication
- **Flask-Mail**: Email functionality for password reset

### **Frontend**
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with custom properties
- **JavaScript (ES6+)**: Interactive functionality
- **Fetch API**: Modern HTTP requests
- **Local Storage**: Client-side data persistence

### **Database**
- **PostgreSQL 12+**: Robust relational database
- **SQLAlchemy ORM**: Object-relational mapping
- **Database Migrations**: Automatic table creation

## 📋 Prerequisites

- **Python 3.8 or higher**
- **PostgreSQL 12 or higher**
- **Git** (for cloning)
- **Windows 10/11** (for executable)

## 🚀 Installation & Setup

### **Option 1: Quick Setup (Recommended)**

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd Attendence_Management
   ```

2. **Run Setup Script**
   ```bash
   setup.bat
   ```
   This will:
   - Check Python and PostgreSQL installation
   - Install Python dependencies
   - Create the database with 10GB size limit
   - Set up all required configurations

3. **Start the Application**
   ```bash
   start.bat
   ```
   Or manually:
   ```bash
   python app.py
   ```

4. **Access the Application**
   - Open browser: `http://localhost:5001`
   - Register your first admin account
   - Start using the system!

### **Option 2: Manual Setup**

1. **Install PostgreSQL**
   - Download from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
   - Run the installer and follow the setup wizard
   - Remember the password you set for the `postgres` user
   - Add PostgreSQL to your system PATH

2. **Create the Database**
   ```bash
   psql -U postgres -f setup_database.sql
   ```

3. **Install Python Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Database Connection**
   Edit `app.py` and update the database connection:
   ```python
   app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:YOUR_PASSWORD@localhost/Attendence_Manager'
   ```

5. **Run the Application**
   ```bash
   python app.py
   ```

## 🗄️ Database Configuration

The system uses PostgreSQL with these settings:
- **Database Name**: `Attendence_Manager`
- **Username**: `postgres`
- **Password**: Set during PostgreSQL installation
- **Host**: `localhost`
- **Port**: `5432`
- **Size Limit**: 10GB

## 📁 Project Structure

```
Attendence_Management/
├── app.py                 # Main Flask application
├── config.py              # Configuration settings
├── requirements.txt       # Python dependencies
├── setup_database.sql    # Database setup script
├── icon.ico              # Application icon
├── setup.bat             # Automated setup script
├── start.bat             # Application launcher
├── dist/                 # Executable files
│   └── Attendance Management System.exe
├── static/               # Static files
│   ├── style.css         # Main stylesheet
│   ├── js/               # JavaScript files
│   │   ├── auth.js       # Authentication logic
│   │   ├── dashboard.js  # Dashboard functionality
│   │   ├── attendance.js # Attendance management
│   │   ├── classes.js    # Class management
│   │   ├── students.js   # Student management
│   │   ├── users.js      # User management
│   │   └── reports.js    # Reports functionality
│   └── templates/        # HTML templates
│       ├── index.html    # Landing page
│       ├── login.html    # Login page
│       ├── register.html # Registration page
│       ├── dashboard.html # Dashboard
│       ├── attendance.html # Attendance management
│       ├── add-class.html # Class management
│       ├── add-student.html # Student management
│       ├── user-management.html # User management
│       └── report.html   # Reports
└── templates/            # Flask templates
    ├── index.html        # Landing page
    ├── login.html        # Login page
    ├── register.html     # Registration page
    ├── dashboard.html    # Dashboard
    ├── attendance.html   # Attendance management
    ├── add-class.html    # Class management
    ├── add-student.html  # Student management
    ├── user-management.html # User management
    └── report.html       # Reports
```

## 🔧 API Endpoints

### **Authentication**
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/forgot-password` - Password reset

### **Dashboard**
- `GET /api/dashboard/stats` - Dashboard statistics with recent attendance

### **Classes**
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create new class
- `PUT /api/classes/<id>` - Update class
- `DELETE /api/classes/<id>` - Delete class

### **Students**
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `PUT /api/students/<id>` - Update student
- `DELETE /api/students/<id>` - Delete student

### **Users**
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/<id>` - Update user
- `DELETE /api/users/<id>` - Delete user

### **Attendance**
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/class/<id>` - Get students in class
- `GET /api/student/attendance` - Get student-specific attendance
- `GET /api/student/attendance/date/<date>` - Get student attendance by date
- `GET /api/student/attendance/today` - Get today's student attendance

### **Reports**
- `GET /api/reports` - Get filtered reports

## 🎯 Key Features & Recent Fixes

### **✅ Student Dashboard Enhancement**
- **Class-wide Recent Attendance**: Students now see all recent attendance records for their class (not just individual)
- **Real-time Updates**: Dashboard shows live attendance data
- **Consistent Experience**: Same dashboard interface as admin/teacher users

### **✅ Database Optimization**
- **Proper User-Student Linking**: Student users correctly linked to student records
- **Data Integrity**: Clean database with no orphaned records
- **Performance**: Optimized queries for better performance

### **✅ Attendance Status Display**
- **Accurate Status**: Shows "Present", "Absent", or "Not Marked" correctly
- **Date-specific Display**: Proper attendance status for selected dates
- **Visual Indicators**: Color-coded status badges

### **✅ Today's Attendance**
- **Real-time Status**: Shows today's attendance status immediately
- **Student-specific View**: Students see their own today's attendance
- **Admin/Teacher View**: Full class today's attendance overview

## 🔒 Security Features

- **Password Hashing**: Using Werkzeug for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for different roles
- **Input Validation**: Comprehensive input sanitization
- **CORS Protection**: Cross-origin request protection
- **SQL Injection Prevention**: Through SQLAlchemy ORM

## 🎨 UI/UX Features

- **Real-time Clock**: Updates every second
- **Modern Design**: Olive green (#808000) and sand beige (#F5F5DC)
- **Neumorphic Style**: Soft, rounded buttons with shadows
- **Responsive Layout**: Works on all screen sizes
- **Search & Filter**: All tables support searching
- **Export & Print**: Reports can be exported to CSV
- **Status Badges**: Visual attendance status indicators

## 🚀 Usage Guide

### **1. First Time Setup**
1. Start the application: `python app.py`
2. Open browser and go to `http://localhost:5000`
3. Click "Register" to create the first admin account
4. Fill in all required fields and select "Admin" as the role
5. Login with your new account

### **2. Adding Classes**
1. Login as an Admin or Teacher
2. Navigate to "Add Class" from the sidebar
3. Enter class name and student counts
4. Click "Add Class"

### **3. Adding Students**
1. Navigate to "Add Student" from the sidebar
2. Fill in student details and select a class
3. Click "Add Student"

### **4. Marking Attendance**
1. Navigate to "Attendance" from the sidebar
2. Select a date and class
3. Mark students as present or absent
4. Click "Save Attendance"

### **5. Generating Reports**
1. Navigate to "Report" from the sidebar
2. Select filters (class, date range, etc.)
3. Click "Generate Report"
4. Use "Export" or "Print" buttons as needed

## 📱 Executable Version

The system includes a standalone executable:
- **File**: `dist/Attendance Management System.exe`
- **Size**: ~22MB
- **Features**: All web features in a desktop application
- **Requirements**: No Python installation needed
- **Database**: Uses embedded PostgreSQL

## 🐛 Recent Bug Fixes

### **Fixed Issues**
1. ✅ **Student Dashboard Recent Attendance**: Now shows class-wide attendance instead of individual
2. ✅ **Database User-Student Linking**: Proper linkage between user accounts and student records
3. ✅ **Attendance Status Display**: Correct status showing for all users
4. ✅ **Today's Attendance**: Real-time today's attendance display
5. ✅ **Dashboard Consistency**: Same experience for all user roles

### **Technical Improvements**
- Enhanced error handling in dashboard stats endpoint
- Improved database relationship loading
- Better serialization of attendance data
- Optimized queries for performance
- Cleaned up test data and orphaned records

## 🔧 Troubleshooting

### **Common Issues**
1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check database credentials in `app.py`
   - Verify database exists: `psql -U postgres -l`

2. **Port Already in Use**
   - Change port in `app.py`: `app.run(host='0.0.0.0', port=5001)`
   - Or kill existing process: `netstat -ano | findstr :5000`

3. **Module Import Errors**
   - Install dependencies: `pip install -r requirements.txt`
   - Check Python version: `python --version`

4. **Student Dashboard Issues**
   - Ensure student user is linked to student record
   - Check database relationships
   - Verify attendance data exists

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Ensure all prerequisites are installed
4. Verify database connectivity

## 🎉 Success!

Your Attendance Management System is now:
- ✅ **Fully Functional**
- ✅ **Error-Free** 
- ✅ **Secure**
- ✅ **Ready for Production Use**

**Start the application and enjoy your comprehensive Attendance Management System!** 