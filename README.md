# **Exam Security System**

**A web-based application for managing exam day security operations, including identity verification, seating compliance, and violation recording.**

## **📌 Project Overview**

The **Exam Security System** is designed to maintain the integrity of exam sessions by ensuring that only registered students enter the exam room and sit in their assigned seats. It streamlines the check-in process for proctors using **Face Recognition** (ML/CV) and provides administrators with tools to manage exams, rosters, and seating plans.

### **Key Features**

* **Role-Based Access Control:** Distinct portals for **Administrators** (setup & reporting) and **Proctors** (exam day operations).  
* **Exam & Roster Management:** Create exams, manage rooms, and import student rosters via CSV.  
* **Seating Plan Builder:** Visual tool to create grid-based or manual seating layouts and assign students.  
* **Smart Check-In:**  
  * **Identity Verification:** Compares live webcam capture against registered reference photos.  
  * **Seat Compliance:** Verifies if the student is sitting in their assigned seat.  
* **Violation Management:** Record and track exam anomalies with severity levels and optional evidence photos.  
* **Reporting:** Generate comprehensive reports on check-ins, mismatches, and violations.

## **🛠 Technology Stack**

### **Backend**

* **Language:** Python 3.12+  
* **Framework:** Flask (REST API)  
* **Database:** MySQL / MariaDB (via SQLAlchemy ORM)  
* **Authentication:** JWT (JSON Web Tokens)  
* **Machine Learning:** face\_recognition / dlib (for identity verification)

### **Frontend**

* **Framework:** React 18 (Vite)  
* **Language:** TypeScript  
* **Styling:** Tailwind CSS  
* **HTTP Client:** Axios

## **📂 Project Structure**

exam-security-system/  
├── analysis/              \# Requirements (SRS) and analysis documents  
├── database/              \# SQL schema and dummy data scripts  
├── diagrams/              \# UML diagrams (Use Case, ERD, Sequence, etc.)  
├── src/  
│   ├── backend/           \# Flask API application  
│   │   ├── app/           \# Application logic (models, routes, services)  
│   │   ├── migrations/    \# Database migrations (Alembic)  
│   │   ├── uploads/       \# Storage for reference and evidence photos  
│   │   └── requirements.txt  
│   └── frontend/          \# React application  
│       ├── src/           \# Components, pages, hooks, context  
│       └── package.json  
└── test-docs/             \# Test cases and results

## **🚀 Getting Started**

### **Prerequisites**

* **Python** 3.8 or higher  
* **Node.js** 16+ and npm  
* **MySQL** or **MariaDB** server

### **1\. Database Setup**

1. Log in to your MySQL server.  
2. Create the database:  
   CREATE DATABASE exam\_security CHARACTER SET utf8mb4 COLLATE utf8mb4\_unicode\_ci;

3. (Optional) You can seed initial data later using the provided Python script.

### **2\. Backend Installation**

Navigate to the backend directory:

cd src/backend

Create and activate a virtual environment:

\# Windows  
python \-m venv venv  
venv\\Scripts\\activate

\# macOS/Linux  
python3 \-m venv venv  
source venv/bin/activate

Install dependencies:

pip install \-r requirements.txt

Configure Environment Variables:

1. Copy .env.example to .env:  
   cp .env.example .env

2. Edit .env and update the DATABASE\_URL with your credentials:  
   DATABASE\_URL=mysql+pymysql://user:password@localhost:3306/exam\_security

Initialize Database and Seed Data:

\# Apply migrations  
flask db upgrade

\# Seed roles and admin user (admin@example.com / admin)  
python seed\_data.py

\# (Optional) Seed dummy students  
python seed\_students.py

Run the Server:

python manage.py

*The backend will run on http://localhost:5000.*

### **3\. Frontend Installation**

Open a new terminal and navigate to the frontend directory:

cd src/frontend

Install dependencies:

npm install

Configure Environment:

1. Create a .env file in src/frontend:  
   VITE\_API\_BASE=http://localhost:5000

Run the Development Server:

npm run dev

*The frontend will run on http://localhost:5173.*

## **📖 Usage Guide**

### **Default Credentials**

If you ran seed\_data.py, you can log in with:

* **Email:** admin@example.com  
* **Password:** admin

### **Workflow**

1. **Login** as an Administrator.  
2. **Rooms:** Go to "Rooms" and add a room (e.g., "Hall A", Capacity 50).  
3. **Exams:** Create a new Exam linked to that Room.  
4. **Roster:** Navigate to the Exam details and import students (CSV) or add them manually.  
5. **Seating Plan:** Go to "Seating Plan", generate a grid layout, and assign students to seats.  
6. **Proctoring:**  
   * Create a "Proctor" user (or log out and log back in as a Proctor if you created one).  
   * Go to **Check-In**.  
   * Select the active exam.  
   * Select a student, upload/capture their photo to verify identity, and confirm their seat.  
   * If issues arise, go to **Violations** to record the incident.

## **🧪 Testing**

The project includes unit tests for the backend.

To run backend tests:

cd src/backend  
\# Set PYTHONPATH to include the app directory  
export PYTHONPATH=$PYTHONPATH:$(pwd)  
pytest tests/unit

## **👥 Contributors**

* **Deniz Sarıgül**  
* **Emre Koç**  
* **Yavuz Yaman**

## **📄 License**

This project is developed for the Software Validation and Testing course.