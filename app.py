import os
import jwt
import secrets
import threading
import time
import webbrowser
from datetime import datetime, date
from functools import wraps
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__, static_folder='static', static_url_path='/static')
app.config['SECRET_KEY'] = 'attendance_management_system_secret_key_2024'
app.config['JWT_SECRET_KEY'] = 'jwt_secret_key_for_attendance_system_2024'
# Database configuration - use environment variable for production
import os
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://postgres:ZAHRA12468@localhost/Attendence_Manager')
if DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Email configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'your-email@gmail.com'  # Update with your email
app.config['MAIL_PASSWORD'] = 'your-app-password'     # Update with your app password

CORS(app)
db = SQLAlchemy(app)
mail = Mail(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    cnic = db.Column(db.String(15), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    address = db.Column(db.Text, nullable=False)
    role = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Class(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    male_count = db.Column(db.Integer, default=0)
    female_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    registration_number = db.Column(db.String(50), unique=True, nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('class.id'), nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    class_obj = db.relationship('Class', backref='students')
    user = db.relationship('User', backref='student_records')

class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('class.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(10), nullable=False)  # present/absent
    marked_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    student = db.relationship('Student', backref='attendance_records')
    class_obj = db.relationship('Class', backref='attendance_records')
    marked_by_user = db.relationship('User', backref='marked_attendance')

# Authentication decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token required'}), 401
        try:
            token = token.split(' ')[1]
            data = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'error': 'Invalid token'}), 401
        return f(current_user, *args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token required'}), 401
        try:
            token = token.split(' ')[1]
            data = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user or current_user.role not in ['Admin', 'Teacher']:
                return jsonify({'error': 'Admin access required'}), 403
        except Exception as e:
            return jsonify({'error': 'Invalid token'}), 401
        return f(current_user, *args, **kwargs)
    return decorated_function

# Test route
@app.route('/test')
def test():
    return "Flask app is working!"

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "message": "App is running successfully"})

# Favicon route
@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'icon.ico', mimetype='image/vnd.microsoft.icon')

# Routes
@app.route('/')
def index():
    try:
        return render_template('index.html')
    except Exception as e:
        print(f"Error rendering index.html: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        # Fallback to simple HTML if template fails
        return '''
        <!DOCTYPE html>
        <html>
        <head>
            <title>Attendance Management System</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .container { max-width: 600px; margin: 0 auto; text-align: center; }
                .btn { display: inline-block; padding: 10px 20px; margin: 10px; text-decoration: none; 
                       background-color: #007bff; color: white; border-radius: 5px; }
                .btn-secondary { background-color: #6c757d; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Attendance Management System</h1>
                <p>Welcome to the Attendance Management System</p>
                <div>
                    <a href="/login" class="btn">Login</a>
                    <a href="/register" class="btn btn-secondary">Register</a>
                </div>
            </div>
        </body>
        </html>
        '''

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/register')
def register_page():
    return render_template('register.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/attendance')
def attendance():
    return render_template('attendance.html')

@app.route('/add-class')
def add_class():
    return render_template('add-class.html')

@app.route('/add-student')
def add_student():
    return render_template('add-student.html')

@app.route('/report')
def report():
    return render_template('report.html')

@app.route('/user-management')
def user_management():
    return render_template('user-management.html')

@app.route('/forgot-password')
def forgot_password_page():
    return render_template('forgot-password.html')

@app.route('/reset-password')
def reset_password_page():
    return render_template('reset-password.html')

# API Routes
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['full_name', 'email', 'password', 'phone', 'cnic', 'date_of_birth', 'gender', 'address', 'role']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        # Create new user
        user = User(
            full_name=data['full_name'],
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            phone=data['phone'],
            cnic=data['cnic'],
            date_of_birth=datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date(),
            gender=data['gender'],
            address=data['address'],
            role=data['role']
        )
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user = User.query.filter_by(email=data['email']).first()
        
        if user and check_password_hash(user.password_hash, data['password']):
            token = jwt.encode(
                {'user_id': user.id, 'email': user.email, 'role': user.role, 'full_name': user.full_name},
                app.config['JWT_SECRET_KEY'],
                algorithm='HS256'
            )
            return jsonify({
                'token': token,
                'user': {
                    'id': user.id,
                    'full_name': user.full_name,
                    'email': user.email,
                    'role': user.role
                }
            })
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'error': 'Login failed'}), 500

@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get('email')
        new_password = data.get('new_password')
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return jsonify({'error': 'Email not found'}), 404
        
        if new_password:
            # Update password hash
            user.password_hash = generate_password_hash(new_password)
            db.session.commit()
            return jsonify({'message': 'Password updated successfully'})
        else:
            # Email exists, prompt for new password
            return jsonify({'message': 'Email verified, please enter a new password'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Password reset failed'}), 500

@app.route('/api/dashboard/stats', methods=['GET'])
@login_required
def get_dashboard_stats(current_user):
    try:
        print(f"Dashboard stats requested by user: {current_user.role} - {current_user.email}")
        
        total_students = Student.query.count()
        total_classes = Class.query.count()
        total_users = User.query.count()
        
        # Get today's attendance
        today = date.today()
        today_attendance = Attendance.query.filter_by(date=today).count()
        
        # Get recent attendance for all users
        recent_attendance = []
        if current_user.role == 'Student':
            # Use the exact same logic as the working student attendance endpoint
            student = Student.query.filter_by(user_id=current_user.id).first()
            print(f"Student found: {student}")
            if student:
                print(f"Student class_id: {student.class_id}")
                # Get attendance records for ALL students in the same class (same as student attendance endpoint)
                recent_attendance = Attendance.query.filter_by(class_id=student.class_id).all()
                print(f"Recent attendance for student class: {len(recent_attendance)} records")
            else:
                print("❌ No student record found for user")
                # Fallback: get all attendance records (same as student attendance endpoint fallback)
                recent_attendance = Attendance.query.all()
                print(f"Fallback attendance for student: {len(recent_attendance)} records")
        else:
            # For admin/teacher, get all recent attendance (last 10 records)
            recent_attendance = Attendance.query.join(Student).join(Class)\
                .order_by(Attendance.date.desc(), Attendance.created_at.desc())\
                .limit(10).all()
            print(f"Recent attendance for admin/teacher: {len(recent_attendance)} records")
        
        # Use the exact same serialization approach as the working student attendance endpoint
        recent_attendance_data = []
        for a in recent_attendance:
            try:
                # Ensure relationships are loaded
                if not hasattr(a, 'student') or a.student is None:
                    print(f"Warning: Attendance record {a.id} has no student relationship")
                    continue
                if not hasattr(a, 'class_obj') or a.class_obj is None:
                    print(f"Warning: Attendance record {a.id} has no class relationship")
                    continue
                if not hasattr(a, 'marked_by_user') or a.marked_by_user is None:
                    print(f"Warning: Attendance record {a.id} has no marked_by_user relationship")
                    continue
                
                recent_attendance_data.append({
                    'id': a.id,
                    'student_id': a.student.id,
                    'student_name': a.student.name,
                    'registration_number': a.student.registration_number,
                    'class_name': a.class_obj.name,
                    'date': a.date.strftime('%Y-%m-%d'),
                    'status': a.status,
                    'marked_by': a.marked_by_user.full_name
                })
            except Exception as e:
                print(f"Error serializing attendance record {a.id}: {e}")
                # Skip this record if there's an error
                continue
        
        result = {
            'total_students': total_students,
            'total_classes': total_classes,
            'total_users': total_users,
            'today_attendance': today_attendance,
            'recent_attendance': recent_attendance_data
        }
        
        print(f"Returning dashboard stats with {len(result['recent_attendance'])} recent attendance records")
        return jsonify(result)
    except Exception as e:
        print(f"Error in dashboard stats: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': 'Failed to load dashboard stats'}), 500

@app.route('/api/classes', methods=['GET', 'POST'])
@admin_required
def manage_classes(current_user):
    try:
        if request.method == 'GET':
            classes = Class.query.all()
            return jsonify([{
                'id': c.id,
                'name': c.name,
                'male_count': c.male_count,
                'female_count': c.female_count,
                'created_at': c.created_at.strftime('%Y-%m-%d')
            } for c in classes])
        
        elif request.method == 'POST':
            data = request.get_json()
            new_class = Class(
                name=data['name'],
                male_count=data.get('male_count', 0),
                female_count=data.get('female_count', 0)
            )
            db.session.add(new_class)
            db.session.commit()
            return jsonify({'message': 'Class created successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to manage classes'}), 500

@app.route('/api/classes/<int:class_id>', methods=['PUT', 'DELETE'])
@admin_required
def manage_class(current_user, class_id):
    try:
        class_obj = Class.query.get_or_404(class_id)
        print(f"Attempting to manage class {class_id}: {class_obj.name}")
        
        if request.method == 'PUT':
            data = request.get_json()
            class_obj.name = data['name']
            class_obj.male_count = data.get('male_count', 0)
            class_obj.female_count = data.get('female_count', 0)
            db.session.commit()
            return jsonify({'message': 'Class updated successfully'})
        
        elif request.method == 'DELETE':
            print(f"Starting deletion process for class {class_id}")
            
            # Delete related attendance records first
            attendance_records = Attendance.query.filter_by(class_id=class_id).all()
            for record in attendance_records:
                db.session.delete(record)
            db.session.commit()
            print(f"Deleted {len(attendance_records)} attendance records")
            
            # Delete students in this class
            students = Student.query.filter_by(class_id=class_id).all()
            for student in students:
                db.session.delete(student)
            db.session.commit()
            print(f"Deleted {len(students)} students")
            
            # Delete the class
            db.session.delete(class_obj)
            db.session.commit()
            print(f"Successfully deleted class {class_id}")
            
            return jsonify({'message': 'Class deleted successfully'})
                
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting class {class_id}: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return jsonify({'error': f'Failed to manage class: {str(e)}'}), 500

@app.route('/api/students', methods=['GET', 'POST'])
@admin_required
def manage_students(current_user):
    try:
        if request.method == 'GET':
            students = Student.query.join(Class).all()
            return jsonify([{
                'id': s.id,
                'name': s.name,
                'registration_number': s.registration_number,
                'class_id': s.class_id,
                'class_name': s.class_obj.name,
                'gender': s.gender,
                'user_id': s.user_id,
                'created_at': s.created_at.strftime('%Y-%m-%d')
            } for s in students])
        
        elif request.method == 'POST':
            data = request.get_json()
            print(f"Received student data: {data}")
            
            # Validate required fields
            required_fields = ['name', 'registration_number', 'class_id', 'gender']
            for field in required_fields:
                if not data.get(field):
                    field_display = field.replace('_', ' ').title()
                    return jsonify({'error': f'{field_display} is required. Please fill in all required fields.'}), 400
            
            # Check if registration number already exists
            existing_student = Student.query.filter_by(registration_number=data['registration_number']).first()
            if existing_student:
                return jsonify({'error': f'Registration number "{data["registration_number"]}" already exists. Please use a different registration number.'}), 400
            
            # Check if class exists
            try:
                class_id = int(data['class_id'])
                class_exists = Class.query.get(class_id)
                if not class_exists:
                    return jsonify({'error': f'Selected class (ID: {class_id}) does not exist. Please select a valid class.'}), 400
            except (ValueError, TypeError):
                return jsonify({'error': f'Invalid class ID format: "{data["class_id"]}". Please select a valid class.'}), 400
            
            # Validate user_id if provided
            if data.get('user_id'):
                try:
                    user_id = int(data['user_id'])
                    user_exists = User.query.get(user_id)
                    if not user_exists:
                        return jsonify({'error': f'Selected user (ID: {user_id}) does not exist. Please select a valid user or leave this field empty.'}), 400
                except (ValueError, TypeError):
                    return jsonify({'error': f'Invalid user ID format: "{data["user_id"]}". Please enter a valid user ID or leave this field empty.'}), 400
            
            new_student = Student(
                name=data['name'],
                registration_number=data['registration_number'],
                class_id=int(data['class_id']),
                gender=data['gender'],
                user_id=int(data['user_id']) if data.get('user_id') else None
            )
            
            db.session.add(new_student)
            db.session.commit()
            
            return jsonify({'message': 'Student created successfully', 'student_id': new_student.id}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error in manage_students: {str(e)}")
        return jsonify({'error': f'Failed to manage students: {str(e)}'}), 500

@app.route('/api/students/<int:student_id>', methods=['PUT', 'DELETE'])
@admin_required
def manage_student(current_user, student_id):
    try:
        student = Student.query.get_or_404(student_id)
        print(f"Attempting to delete student {student_id}: {student.name}")
        
        if request.method == 'PUT':
            data = request.get_json()
            student.name = data['name']
            student.registration_number = data['registration_number']
            student.class_id = int(data['class_id'])
            student.gender = data['gender']
            db.session.commit()
            return jsonify({'message': 'Student updated successfully'})
        
        elif request.method == 'DELETE':
            print(f"Starting deletion process for student {student_id}")
            
            # Delete related attendance records first
            attendance_records = Attendance.query.filter_by(student_id=student_id).all()
            for record in attendance_records:
                db.session.delete(record)
            db.session.commit()
            print(f"Deleted {len(attendance_records)} attendance records")
            
            # Delete the student
            db.session.delete(student)
            db.session.commit()
            print(f"Successfully deleted student {student_id}")
            
            return jsonify({'message': 'Student deleted successfully'})
                
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting student {student_id}: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return jsonify({'error': f'Failed to manage student: {str(e)}'}), 500

@app.route('/api/users', methods=['GET', 'POST'])
@admin_required
def manage_users(current_user):
    try:
        if request.method == 'GET':
            users = User.query.all()
            return jsonify([{
                'id': u.id,
                'full_name': u.full_name,
                'email': u.email,
                'role': u.role,
                'phone': u.phone,
                'gender': u.gender
            } for u in users])
        
        elif request.method == 'POST':
            data = request.get_json()
            new_user = User(
                full_name=data['full_name'],
                email=data['email'],
                password_hash=generate_password_hash(data['password']),
                phone=data['phone'],
                cnic=data['cnic'],
                date_of_birth=datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date(),
                gender=data['gender'],
                address=data['address'],
                role=data['role']
            )
            db.session.add(new_user)
            db.session.commit()
            return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to manage users'}), 500

@app.route('/api/users/<int:user_id>', methods=['PUT', 'DELETE'])
@admin_required
def manage_user(current_user, user_id):
    try:
        user = User.query.get_or_404(user_id)
        print(f"Attempting to manage user {user_id}: {user.full_name}")
        
        if request.method == 'PUT':
            data = request.get_json()
            user.full_name = data['full_name']
            user.email = data['email']
            user.phone = data['phone']
            user.cnic = data['cnic']
            user.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
            user.gender = data['gender']
            user.address = data['address']
            user.role = data['role']
            db.session.commit()
            return jsonify({'message': 'User updated successfully'})
        
        elif request.method == 'DELETE':
            print(f"Starting deletion process for user {user_id}")
            
            # Prevent deleting the current user
            if user_id == current_user.id:
                print(f"Cannot delete current user {user_id}")
                return jsonify({'error': 'Cannot delete your own account'}), 400
            
            # Delete attendance records where this user marked attendance
            attendance_records = Attendance.query.filter_by(marked_by=user_id).all()
            for record in attendance_records:
                db.session.delete(record)
            db.session.commit()
            print(f"Deleted {len(attendance_records)} attendance records")
            
            # Delete students associated with this user
            students = Student.query.filter_by(user_id=user_id).all()
            for student in students:
                db.session.delete(student)
            db.session.commit()
            print(f"Deleted {len(students)} students")
            
            # Delete the user
            db.session.delete(user)
            db.session.commit()
            print(f"Successfully deleted user {user_id}")
            
            return jsonify({'message': 'User deleted successfully'})
                
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting user {user_id}: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return jsonify({'error': f'Failed to manage user: {str(e)}'}), 500

@app.route('/api/attendance', methods=['GET', 'POST'])
@login_required
def manage_attendance(current_user):
    try:
        if request.method == 'GET':
            # Return all attendance records for all users (frontend will filter by class and date)
            attendance_records = Attendance.query.join(Student).join(Class).all()
            
            return jsonify([{
                'id': a.id,
                'student_id': a.student.id,
                'student_name': a.student.name,
                'registration_number': a.student.registration_number,
                'class_id': a.class_id,
                'class_name': a.class_obj.name,
                'date': a.date.strftime('%Y-%m-%d'),
                'status': a.status,
                'marked_by': a.marked_by_user.full_name
            } for a in attendance_records])
        
        elif request.method == 'POST':
            # Only Admin and Teacher can mark attendance
            if current_user.role not in ['Admin', 'Teacher']:
                return jsonify({'error': 'Students cannot mark attendance'}), 403
            
            data = request.get_json()
            
            # Check if attendance already exists for this student and date
            existing = Attendance.query.filter_by(
                student_id=data['student_id'],
                date=datetime.strptime(data['date'], '%Y-%m-%d').date()
            ).first()
            
            if existing:
                existing.status = data['status']
                existing.marked_by = current_user.id
            else:
                new_attendance = Attendance(
                    student_id=data['student_id'],
                    class_id=data['class_id'],
                    date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
                    status=data['status'],
                    marked_by=current_user.id
                )
                db.session.add(new_attendance)
            
            db.session.commit()
            return jsonify({'message': 'Attendance marked successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to manage attendance'}), 500

@app.route('/api/attendance/class/<int:class_id>', methods=['GET'])
@login_required
def get_class_attendance(current_user, class_id):
    try:
        students = Student.query.filter_by(class_id=class_id).all()
        return jsonify([{
            'id': s.id,
            'name': s.name,
            'registration_number': s.registration_number,
            'gender': s.gender,
            'user_id': s.user_id
        } for s in students])
    except Exception as e:
        return jsonify({'error': 'Failed to load class students'}), 500

@app.route('/api/attendance/classes', methods=['GET'])
@login_required
def get_attendance_classes(current_user):
    """Get all classes for attendance (accessible by all users)"""
    try:
        classes = Class.query.all()
        return jsonify([{
            'id': c.id,
            'name': c.name,
            'male_count': c.male_count,
            'female_count': c.female_count
        } for c in classes])
    except Exception as e:
        return jsonify({'error': 'Failed to load classes'}), 500

# New endpoints for students to access classes and students for reports
@app.route('/api/report/classes', methods=['GET'])
@login_required
def get_report_classes(current_user):
    """Get all classes for report generation (accessible by all users)"""
    try:
        classes = Class.query.all()
        return jsonify([{
            'id': c.id,
            'name': c.name,
            'male_count': c.male_count,
            'female_count': c.female_count
        } for c in classes])
    except Exception as e:
        return jsonify({'error': 'Failed to load classes'}), 500

@app.route('/api/report/students', methods=['GET'])
@login_required
def get_report_students(current_user):
    """Get all students for report generation (accessible by all users)"""
    try:
        students = Student.query.join(Class).all()
        return jsonify([{
            'id': s.id,
            'name': s.name,
            'registration_number': s.registration_number,
            'class_name': s.class_obj.name,
            'gender': s.gender
        } for s in students])
    except Exception as e:
        return jsonify({'error': 'Failed to load students'}), 500

@app.route('/api/student/attendance', methods=['GET'])
@login_required
def get_student_attendance(current_user):
    """Get attendance records for all students in the current student's class"""
    try:
        if current_user.role not in ['Student']:
            return jsonify({'error': 'Access denied'}), 403
        
        # Get the student record for the current user
        student = Student.query.filter_by(user_id=current_user.id).first()
        if not student:
            # Return empty array if no student record found
            return jsonify([])
        
        # Get attendance records for ALL students in the same class
        attendance_records = Attendance.query.filter_by(class_id=student.class_id).all()
        
        return jsonify([{
            'id': a.id,
            'student_id': a.student.id,
            'student_name': a.student.name,
            'registration_number': a.student.registration_number,
            'class_name': a.class_obj.name,
            'date': a.date.strftime('%Y-%m-%d'),
            'status': a.status,
            'marked_by': a.marked_by_user.full_name
        } for a in attendance_records])
    except Exception as e:
        return jsonify({'error': f'Failed to load student attendance: {str(e)}'}), 500

@app.route('/api/student/attendance/date/<date>', methods=['GET'])
@login_required
def get_student_attendance_by_date(current_user, date):
    """Get attendance for a specific student on a specific date"""
    try:
        if current_user.role not in ['Student']:
            return jsonify({'error': 'Access denied'}), 403
        
        # Get the student record for the current user
        student = Student.query.filter_by(user_id=current_user.id).first()
        if not student:
            return jsonify({'error': 'Student record not found'}), 404
        
        # Parse the date
        try:
            attendance_date = datetime.strptime(date, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400
        
        # Get attendance record for this student on this date
        attendance_record = Attendance.query.filter_by(
            student_id=student.id,
            date=attendance_date
        ).first()
        
        if attendance_record:
            return jsonify({
                'id': attendance_record.id,
                'student_id': attendance_record.student.id,
                'student_name': attendance_record.student.name,
                'registration_number': attendance_record.student.registration_number,
                'class_name': attendance_record.class_obj.name,
                'date': attendance_record.date.strftime('%Y-%m-%d'),
                'status': attendance_record.status,
                'marked_by': attendance_record.marked_by_user.full_name
            })
        else:
            return jsonify({
                'student_id': student.id,
                'student_name': student.name,
                'registration_number': student.registration_number,
                'class_name': student.class_obj.name,
                'date': date,
                'status': 'Not Marked',
                'marked_by': None
            })
    except Exception as e:
        return jsonify({'error': f'Failed to load student attendance: {str(e)}'}), 500

@app.route('/api/student/attendance/today', methods=['GET'])
@login_required
def get_student_today_attendance(current_user):
    """Get today's attendance for the current student"""
    try:
        if current_user.role not in ['Student']:
            return jsonify({'error': 'Access denied'}), 403
        
        # Get the student record for the current user
        student = Student.query.filter_by(user_id=current_user.id).first()
        if not student:
            return jsonify({'error': 'Student record not found'}), 404
        
        # Get today's date
        today = date.today()
        
        # Get attendance record for this student today
        attendance_record = Attendance.query.filter_by(
            student_id=student.id,
            date=today
        ).first()
        
        if attendance_record:
            return jsonify({
                'id': attendance_record.id,
                'student_id': attendance_record.student.id,
                'student_name': attendance_record.student.name,
                'registration_number': attendance_record.student.registration_number,
                'class_name': attendance_record.class_obj.name,
                'date': attendance_record.date.strftime('%Y-%m-%d'),
                'status': attendance_record.status,
                'marked_by': attendance_record.marked_by_user.full_name
            })
        else:
            return jsonify({
                'student_id': student.id,
                'student_name': student.name,
                'registration_number': student.registration_number,
                'class_name': student.class_obj.name,
                'date': today.strftime('%Y-%m-%d'),
                'status': 'Not Marked',
                'marked_by': None
            })
    except Exception as e:
        return jsonify({'error': f'Failed to load today\'s attendance: {str(e)}'}), 500

@app.route('/api/reports', methods=['GET'])
@login_required
def get_reports(current_user):
    try:
        data = request.args
        class_id = data.get('class_id')
        student_id = data.get('student_id')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        print(f"Report request - User: {current_user.role}, Class: {class_id}, Student: {student_id}, Start: {start_date}, End: {end_date}")
        
        query = Attendance.query.join(Student).join(Class)
        
        # Apply filters
        if class_id and class_id != '':
            query = query.filter(Attendance.class_id == class_id)
        if student_id and student_id != '':
            query = query.filter(Attendance.student_id == student_id)
        if start_date and start_date != '':
            query = query.filter(Attendance.date >= datetime.strptime(start_date, '%Y-%m-%d').date())
        if end_date and end_date != '':
            query = query.filter(Attendance.date <= datetime.strptime(end_date, '%Y-%m-%d').date())
        
        attendance_records = query.all()
        print(f"Found {len(attendance_records)} attendance records")
        
        result = [{
            'id': a.id,
            'student_id': a.student.id,
            'student_name': a.student.name,
            'registration_number': a.student.registration_number,
            'class_name': a.class_obj.name,
            'date': a.date.strftime('%Y-%m-%d'),
            'status': a.status,
            'marked_by': a.marked_by_user.full_name
        } for a in attendance_records]
        
        print(f"Returning {len(result)} records")
        return jsonify(result)
    except Exception as e:
        print(f"Error in get_reports: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': f'Failed to load reports: {str(e)}'}), 500



def open_browser():
    """Open the browser after a short delay"""
    time.sleep(0.5)  # Reduced delay for faster browser opening
    webbrowser.open('http://127.0.0.1:8080')

if __name__ == '__main__':
    try:
        with app.app_context():
            db.create_all()
            print("✅ Database initialized successfully")
            

                
    except Exception as e:
        print(f"⚠️  Database initialization warning: {e}")
        print("Continuing without database initialization...")
    
    # For local development only
    if os.environ.get('FLASK_ENV') != 'production':
        # Start browser thread
        threading.Thread(target=open_browser, daemon=True).start()
        
        # Start server with HTTP on port 8080
        print("🚀 Starting HTTP server with Flask on port 8080...")
        try:
            app.run(debug=False, host='127.0.0.1', port=8080)
        except Exception as e:
            print(f"❌ Flask HTTP server error: {e}")
            print("Server failed to start") 