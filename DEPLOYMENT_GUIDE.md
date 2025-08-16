# Deployment Guide for Attendance Management System

## Deploy to Render (Recommended - Free)

### Step 1: Prepare Your Project
Your project is already configured for deployment. The following files are ready:
- `app.py` - Main Flask application
- `requirements.txt` - Python dependencies
- `Procfile` - Tells Render how to start the app
- `runtime.txt` - Python version
- `render.yaml` - Render deployment configuration

### Step 2: Deploy to Render

1. **Go to [Render.com](https://render.com)** and create a free account

2. **Connect your GitHub repository:**
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select your repository: `Attendence_Management`

3. **Configure the deployment:**
   - **Name:** `attendance-management-system`
   - **Environment:** `Python`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
   - **Plan:** Free

4. **Add Environment Variables:**
   - `FLASK_ENV` = `production`
   - `PYTHON_VERSION` = `3.8.18`

5. **Add Database:**
   - Click "New +" → "PostgreSQL"
   - Name: `attendance-db`
   - Plan: Free
   - Add the database URL to your web service environment variables

6. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)

### Step 3: Get Your Live URL
After deployment, Render will give you a URL like:
`https://attendance-management-system.onrender.com`

### Step 4: Share Your Link
You can now share this URL with anyone to access your attendance management system!

## Alternative Platforms

### Heroku (Paid)
- Good for Flask apps
- PostgreSQL add-on available
- More expensive than Render

### Railway (Free tier available)
- Modern platform
- Good for full-stack apps
- Easy deployment

### DigitalOcean App Platform
- Reliable and scalable
- Good documentation
- Paid service

## Important Notes

1. **Database:** Your app will use a PostgreSQL database provided by Render
2. **Email:** Update email settings in `app.py` for password reset functionality
3. **Security:** The app uses JWT tokens for authentication
4. **Free Tier Limits:** Render free tier has usage limits but is sufficient for testing

## Troubleshooting

- If deployment fails, check the build logs in Render dashboard
- Make sure all files are committed to your GitHub repository
- Verify that `requirements.txt` contains all necessary dependencies

Your attendance management system will be live and accessible to anyone with the URL! 