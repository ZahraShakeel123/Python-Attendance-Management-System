@echo off
echo ========================================
echo GitHub Repository Setup Script
echo ========================================
echo.

echo Initializing Git repository...
git init

echo Adding all files to Git...
git add .

echo Creating initial commit...
git commit -m "Initial commit: Attendance Management System v1.0.0"

echo.
echo ========================================
echo ✅ Git repository initialized successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Create a new repository on GitHub.com
echo 2. Run: git remote add origin https://github.com/YOUR_USERNAME/attendance-management-system.git
echo 3. Run: git branch -M main
echo 4. Run: git push -u origin main
echo.
echo Repository is ready for GitHub!
pause 