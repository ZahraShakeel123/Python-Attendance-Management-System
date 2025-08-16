@echo off
echo ========================================
echo Starting Attendance Management System
echo ========================================
echo.

echo Checking if Python is installed...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from https://python.org
    pause
    exit /b 1
)

echo Checking if required files exist...
if not exist "app.py" (
    echo ERROR: app.py not found
    echo Please run this script from the project directory
    pause
    exit /b 1
)

echo Checking if requirements are installed...
python -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo Installing missing dependencies...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo Starting the application...
echo The application will be available at: http://localhost:5000
echo Press Ctrl+C to stop the application
echo.

python app.py

echo.
echo Application stopped.
pause 