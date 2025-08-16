-- PostgreSQL Database Tables Setup Script for Attendance Management System
-- This script creates the tables in the existing database

-- Connect to the existing database
\c "Attendence_Manager"

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables (Flask-SQLAlchemy will handle this automatically)
-- This script is kept for reference, but the tables will be created by the Flask app

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE "Attendence_Manager" TO postgres;

-- Note: The actual tables will be created by Flask-SQLAlchemy when the application starts
-- This script only sets up the database structure and permissions 