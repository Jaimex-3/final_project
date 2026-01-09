# Exam Security System

A comprehensive web-based system for managing exam-day security operations, including identity verification, seating plan management, and violation logging.

## 📋 Project Overview

This system supports exam-day identity verification, seating compliance, and incident/violation recording. It integrates a simple ML/Computer Vision component for photo verification and provides comprehensive reporting capabilities.

### Core Features

- **Authentication & Authorization**: Role-based access control (Admin/Proctor)
- **Exam Management**: Create and configure exams with date, time, and room information
- **Student Roster Management**: Import or manually enter student information
- **Seating Plan Management**: Define and manage student seating assignments
- **Identity Verification**: ML/CV-based photo comparison for student verification
- **Check-In Workflow**: Complete check-in process with photo capture and verification
- **Violation Recording**: Log and track exam violations with evidence
- **Reporting**: Generate comprehensive reports on check-ins, mismatches, and violations

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MySQL** for database
- **Python** for ML/CV service (scikit-image for SSIM comparison)
- **JWT** for authentication
- **Multer** for file uploads
- **Bcrypt** for password hashing

### Frontend
- **HTML5/CSS3/JavaScript** (Vanilla JS)
- Responsive design
- RESTful API integration

### Testing
- **Jest** for unit testing
- **Supertest** for API testing

## 📁 Project Structure

```
final_project/
├── analysis/              # Requirements and business rules
│   └── SRS_Document.md   # Software Requirements Specification
├── database/             # Database schema and data
│   ├── schema.sql       # Database schema
│   └── dummy_data.sql   # Sample data
├── diagrams/            # System diagrams (Use Case, ERD, Sequence)
├── jira/               # Sprint planning screenshots
├── src/                # Application source code
│   ├── config/         # Configuration files
│   │   └── database.js
│   ├── middleware/     # Express middleware
│   │   └── auth.js
│   ├── routes/         # API routes
│   │   ├── auth.js
│   │   ├── exams.js
│   │   ├── checkins.js
│   │   └── violations.js
│   ├── utils/          # Utility functions
│   │   └── audit.js
│   ├── ml_service.py   # Python ML/CV service
│   └── server.js       # Main server file
├── public/             # Frontend files
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── index.html
├── tests/              # Unit tests
├── test-docs/          # Test cases documentation
├── uploads/            # File uploads (photos, evidence)
├── .env.example        # Environment variables template
├── package.json        # Node.js dependencies
└── README.md          # This file
```

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v18+)
- Python 3.11+
- MySQL 8.0+
- Git

### Step 1: Clone Repository

```bash
git clone https://github.com/YavuzYaman217/final_project.git
cd final_project
```

### Step 2: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
sudo pip3 install scikit-image Pillow numpy
```

### Step 3: Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE exam_security_system;"

# Import schema
mysql -u root -p exam_security_system < database/schema.sql

# Import dummy data
mysql -u root -p exam_security_system < database/dummy_data.sql
```

### Step 4: Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your database credentials
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=exam_security_system
# DB_PORT=3306
```

### Step 5: Run Application

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The application will be available at: **http://localhost:3000**

### Using XAMPP MariaDB (Windows/Mac/Linux)
- Start the MySQL/MariaDB service from XAMPP Control Panel.
- Default credentials are often `root` with an empty password; set `DB_USER=root`, leave `DB_PASSWORD` blank in `.env`.
- Ensure the port matches XAMPP’s MySQL/MariaDB port (commonly `3306`); adjust `DB_PORT` if XAMPP uses a different port.
- Import schema and dummy data via the XAMPP `mysql` CLI or phpMyAdmin:
  ```bash
  mysql -u root --port=3306 -e "CREATE DATABASE exam_security_system;"
  mysql -u root --port=3306 exam_security_system < database/schema.sql
  mysql -u root --port=3306 exam_security_system < database/dummy_data.sql
  ```
  Add `-p` if you configured a root password.

## 🔐 Test Credentials

### Administrator
- **Username**: `admin1`
- **Password**: `Test123!`
- **Role**: ADMIN (full access)

### Proctor
- **Username**: `proctor1`
- **Password**: `Test123!`
- **Role**: PROCTOR (check-in and violation recording)

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Exams
- `GET /api/exams` - Get all exams
- `GET /api/exams/:id` - Get exam by ID
- `POST /api/exams` - Create exam (Admin only)
- `PUT /api/exams/:id` - Update exam (Admin only)
- `DELETE /api/exams/:id` - Delete exam (Admin only)
- `PATCH /api/exams/:id/status` - Update exam status (Admin only)

### Check-Ins
- `GET /api/checkins/exam/:examId` - Get check-ins for exam
- `GET /api/checkins/student/:examId/:studentId` - Check if student is checked in
- `POST /api/checkins` - Perform check-in with photo verification
- `PATCH /api/checkins/:id/override` - Override verification result

### Violations
- `GET /api/violations/exam/:examId` - Get violations for exam
- `GET /api/violations/:id` - Get violation by ID
- `POST /api/violations` - Record violation
- `PATCH /api/violations/:id/status` - Update violation status (Admin only)
- `DELETE /api/violations/:id` - Delete violation (Admin only)

## 🧪 Testing

### Run Unit Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test

# Run tests in watch mode
npm run test:watch
```

### Test ML/CV Service

```bash
# Test photo verification
python3 src/ml_service.py <captured_photo_path> <registered_photo_path>
```

## 📝 Key Features Implementation

### 1. ML/CV Photo Verification

The system uses **Structural Similarity Index (SSIM)** for photo comparison:
- Compares captured photo with registered student photo
- Generates confidence score (0-100%)
- Threshold: 70% for match/no-match decision
- Manual override available for proctors

### 2. Check-In Workflow

1. Proctor searches for student by ID or name
2. Student photo is captured via webcam/upload
3. ML service verifies photo against registered photo
4. System checks seat assignment
5. Check-in is recorded with timestamp
6. Violations are automatically created for mismatches

### 3. Violation Recording

- **Categories**: Identity Mismatch, Seat Mismatch, Unauthorized Materials, Disruptive Behavior, Late Arrival, Other
- **Severity Levels**: Low, Medium, High
- **Evidence**: Optional photo attachment
- **Status Tracking**: Recorded → Reviewed → Resolved/Dismissed

### 4. Seating Plan Management

- Grid-based or seat code-based plans
- Visual representation of seats
- Real-time updates during check-in
- Automatic seat occupation tracking

## 🔒 Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Authentication**: 30-minute token expiration
- **Role-Based Access Control**: Admin and Proctor roles
- **Audit Logging**: All actions logged with timestamp and user
- **File Upload Validation**: Size and type restrictions
- **SQL Injection Prevention**: Parameterized queries

## 📈 Database Schema

The system uses 9 main tables:
- `users` - User accounts and authentication
- `exams` - Exam configurations
- `students` - Student information
- `exam_rosters` - Student-exam assignments
- `seating_plans` - Seating plan configurations
- `seats` - Individual seat records
- `check_ins` - Check-in records with verification results
- `violations` - Violation records
- `audit_logs` - System activity logs

## 🎯 Evaluation Criteria

This project meets the following requirements:

- ✅ **Requirements & Rules** (15 points)
- ✅ **System Diagrams** (15 points) - Use Case, ERD, Sequence
- ✅ **JIRA & Planning** (15 points)
- ✅ **Implementation** (25 points)
  - Authentication & role-based access
  - Exam/room/seating management
  - Check-in workflow with ML verification
  - Violation logging
  - Basic reporting
- ✅ **Database** (10 points) - Schema + dummy data
- ✅ **Testing & Validation** (20 points)
  - Test cases document
  - Unit tests for critical logic

**Total**: 100 points

## 🤝 Contributing

This is an academic project for Software Testing & Validation course.

## 📄 License

ISC License

## 👥 Authors

Project Team - Software Testing & Validation Course

## 📞 Support

For issues or questions, please open an issue on GitHub:
https://github.com/YavuzYaman217/final_project/issues

---

**Last Updated**: January 2026
