@echo off
echo ========================================
echo Attendance Management System Setup
echo ========================================
echo.

echo Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from https://python.org
    pause
    exit /b 1
)
echo Python is installed ✓

echo.
echo Checking PostgreSQL installation...
psql --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: PostgreSQL is not installed or not in PATH
    echo Please install PostgreSQL from https://postgresql.org/download/windows/
    pause
    exit /b 1
)
echo PostgreSQL is installed ✓

echo.
echo Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)
echo Dependencies installed ✓

echo.
echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo Database is already created.
echo To start the application:
echo 1. Run: python app.py
echo 2. Open your browser and go to: http://localhost:5000
echo 3. Register your first admin account
echo.
echo For more information, see README.md
echo.
pause 