# Attendance Management System - Setup Instructions

## Quick Start Guide

### Prerequisites
1. **Python 3.8+** - Download from [python.org](https://python.org)
2. **PostgreSQL 12+** - Download from [postgresql.org](https://postgresql.org/download/windows/)

### Step-by-Step Setup

#### 1. Install PostgreSQL
1. Download PostgreSQL for Windows
2. Run the installer
3. **Important**: Remember the password you set for the `postgres` user
4. Add PostgreSQL to your system PATH during installation

#### 2. Setup the Project
1. Open Command Prompt as Administrator
2. Navigate to the project directory
3. Run the setup script:
   ```bash
   setup.bat
   ```
   This will:
   - Check Python and PostgreSQL installation
   - Install Python dependencies
   - Create the database with 10GB size limit

#### 3. Start the Application
1. Run the start script:
   ```bash
   start.bat
   ```
   Or manually:
   ```bash
   python app.py
   ```

2. Open your browser and go to: `http://localhost:5000`

#### 4. Create Your First Account
1. Click "Register" on the landing page
2. Fill in all required fields
3. Select "Admin" as the role
4. Click "Register"
5. Login with your new account

## Manual Setup (Alternative)

If the batch files don't work, follow these manual steps:

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Create Database
```bash
psql -U postgres -f setup_database.sql
```

### 3. Configure Database Connection
Edit `app.py` and update the database connection:
```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:YOUR_PASSWORD@localhost/Attendence_Manager'
```

### 4. Run the Application
```bash
python app.py
```

## Database Configuration

The system uses PostgreSQL with these settings:
- **Database Name**: `Attendence_Manager`
- **Username**: `postgres`
- **Password**: Set during PostgreSQL installation
- **Host**: `localhost`
- **Port**: `5432`
- **Size Limit**: 10GB

## Features Overview

### For Admins/Teachers:
- ✅ Add, edit, delete classes
- ✅ Add, edit, delete students
- ✅ Add, edit, delete users
- ✅ Mark attendance for any class
- ✅ Generate and export reports
- ✅ View all attendance records

### For Students:
- ✅ View own attendance records
- ✅ Mark own attendance (if allowed)
- ✅ View own reports

### System Features:
- ✅ Real-time clock and date display
- ✅ Role-based access control
- ✅ Secure authentication with JWT
- ✅ Responsive design
- ✅ Modern UI with olive green/sand beige theme
- ✅ Search and filter functionality
- ✅ Export reports to CSV
- ✅ Print reports

## Troubleshooting

### Database Connection Issues
1. Ensure PostgreSQL service is running
2. Check if database exists: `psql -U postgres -l`
3. Verify password in `app.py`

### Port Already in Use
Change the port in `app.py`:
```python
serve(app, host='127.0.0.1', port=5002)
```

### Permission Issues
1. Run Command Prompt as Administrator
2. Check PostgreSQL service status
3. Verify database user permissions

### Python Issues
1. Ensure Python 3.8+ is installed
2. Check if pip is available
3. Try: `python -m pip install -r requirements.txt`

## File Structure

```
Attendence_Management/
├── app.py                 # Main Flask application
├── config.py              # Configuration settings
├── requirements.txt       # Python dependencies
├── setup_database.sql    # Database setup script
├── setup.bat            # Windows setup script
├── start.bat            # Windows start script
├── style.css             # Main stylesheet
├── index.html            # Landing page
├── login.html            # Login page
├── register.html         # Registration page
├── dashboard.html        # Dashboard
├── attendance.html       # Attendance management
├── add-class.html        # Class management
├── add-student.html      # Student management
├── user-management.html  # User management
├── report.html           # Reports
├── icon.ico              # Application icon
└── js/                   # JavaScript files
    ├── auth.js           # Authentication logic
    ├── dashboard.js      # Dashboard functionality
    ├── attendance.js     # Attendance management
    ├── classes.js        # Class management
    ├── students.js       # Student management
    ├── users.js          # User management
    └── reports.js        # Reports functionality
```

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/forgot-password` - Password reset

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create new class
- `PUT /api/classes/<id>` - Update class
- `DELETE /api/classes/<id>` - Delete class

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `PUT /api/students/<id>` - Update student
- `DELETE /api/students/<id>` - Delete student

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/<id>` - Update user
- `DELETE /api/users/<id>` - Delete user

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/class/<id>` - Get students in class

### Reports
- `GET /api/reports` - Get filtered reports

## Security Features

- ✅ Password hashing using Werkzeug
- ✅ JWT token-based authentication
- ✅ Role-based access control
- ✅ Input validation and sanitization
- ✅ CORS protection
- ✅ SQL injection prevention through SQLAlchemy

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Check the console for error messages
4. Ensure PostgreSQL is running
5. Verify database connection settings

For additional help, refer to the README.md file for detailed documentation. 