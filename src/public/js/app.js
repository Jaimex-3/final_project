/**
 * Exam Security System - Frontend Application
 */

const API_BASE_URL = '/api';
let currentUser = null;
let authToken = null;
let cachedExams = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    authToken = localStorage.getItem('authToken');
    if (authToken) {
        verifyToken();
    } else {
        showPage('loginPage');
    }

    // Setup event listeners
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    document.getElementById('importRosterForm').addEventListener('submit', handleRosterImport);
    document.getElementById('addStudentForm').addEventListener('submit', handleAddStudent);
    document.getElementById('createSeatingForm').addEventListener('submit', handleCreateSeating);
    document.getElementById('checkInForm').addEventListener('submit', handleCheckIn);
    document.getElementById('violationForm').addEventListener('submit', handleViolation);

    document.querySelectorAll('#reportForm button[data-report]').forEach(btn => {
        btn.addEventListener('click', () => handleReport(btn.dataset.report));
    });
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    errorDiv.textContent = '';

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            showPage('dashboardPage');
            loadDashboard();
        } else {
            errorDiv.textContent = data.message || 'Login failed';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = 'Network error. Please try again.';
    }
}

// Handle logout
async function handleLogout() {
    try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
    } catch (error) {
        console.error('Logout error:', error);
    }

    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    authToken = null;
    currentUser = null;

    // Show login page
    showPage('loginPage');
    document.getElementById('loginForm').reset();
}

// Verify token
async function verifyToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showPage('dashboardPage');
            loadDashboard();
        } else {
            // Token invalid, logout
            handleLogout();
        }
    } catch (error) {
        console.error('Verify token error:', error);
        handleLogout();
    }
}

// Show page
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// Load dashboard
async function loadDashboard() {
    // Update user info
    document.getElementById('userInfo').textContent = 
        `${currentUser.firstName} ${currentUser.lastName} (${currentUser.role})`;

    // Load exams
    await loadExams();

    // Load stats (simplified for now)
    await loadStats();
}

// Load exams
async function loadExams() {
    const examsList = document.getElementById('examsList');
    examsList.innerHTML = '<div class="loading">Loading exams...</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/exams`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            cachedExams = data.exams;
            if (data.exams.length === 0) {
                examsList.innerHTML = '<div class="empty-state"><p>No exams found</p></div>';
            } else {
                examsList.innerHTML = data.exams.map(exam => `
                    <div class="exam-card">
                        <h4>${exam.exam_name}</h4>
                        <p><strong>Code:</strong> ${exam.exam_code}</p>
                        <p><strong>Date:</strong> ${formatDate(exam.exam_date)}</p>
                        <p><strong>Time:</strong> ${exam.start_time || ''} ${exam.end_time ? ' - ' + exam.end_time : ''}</p>
                        <p><strong>Room:</strong> ${exam.room_code || 'N/A'} ${exam.room_name ? `(${exam.room_name})` : ''}</p>
                        <p><strong>Duration:</strong> ${exam.duration_minutes || '-'} minutes</p>
                        <span class="exam-status status-${exam.status.toLowerCase()}">${exam.status}</span>
                    </div>
                `).join('');
            }
            populateExamSelects(data.exams);
        } else {
            examsList.innerHTML = '<div class="error-message">Failed to load exams</div>';
        }
    } catch (error) {
        console.error('Load exams error:', error);
        examsList.innerHTML = '<div class="error-message">Network error</div>';
    }
}

function populateExamSelects(exams) {
    const selects = [
        'importExamSelect',
        'seatingExamSelect',
        'checkInExamSelect',
        'violationExamSelect',
        'reportExamSelect'
    ];

    selects.forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        select.innerHTML = exams.map(e => `<option value="${e.exam_id}">${e.exam_name} (${e.exam_code})</option>`).join('');
    });
}

// Load stats
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/exams`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            const totalExams = data.exams.length;
            const activeExams = data.exams.filter(e => e.status === 'ACTIVE').length;

            document.getElementById('totalExams').textContent = totalExams;
            document.getElementById('activeExams').textContent = activeExams;
            document.getElementById('checkInsToday').textContent = '-';
            document.getElementById('totalViolations').textContent = '-';
        }
    } catch (error) {
        console.error('Load stats error:', error);
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// API helper function
async function apiRequest(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, mergedOptions);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

// Roster import
async function handleRosterImport(e) {
    e.preventDefault();
    const resultDiv = document.getElementById('rosterImportResult');
    resultDiv.textContent = '';

    const examId = document.getElementById('importExamSelect').value;
    const fileInput = document.getElementById('rosterFile');
    if (!fileInput.files.length) {
        resultDiv.textContent = 'Please select a CSV file';
        return;
    }

    const formData = new FormData();
    formData.append('examId', examId);
    formData.append('file', fileInput.files[0]);

    try {
        const response = await fetch(`${API_BASE_URL}/rosters/import`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            resultDiv.textContent = `Imported ${data.inserted} students (${data.duplicates} duplicates skipped)`;
        } else {
            resultDiv.textContent = data.message || 'Import failed';
        }
    } catch (error) {
        console.error('Roster import error:', error);
        resultDiv.textContent = 'Network error';
    }
}

// Manual student entry
async function handleAddStudent(e) {
    e.preventDefault();
    const resultDiv = document.getElementById('addStudentResult');
    resultDiv.textContent = '';

    const payload = {
        studentNumber: document.getElementById('studentNumber').value,
        firstName: document.getElementById('studentFirstName').value,
        lastName: document.getElementById('studentLastName').value,
        email: document.getElementById('studentEmail').value,
        registrationNumber: document.getElementById('registrationNumber').value
    };

    const data = await apiRequest('/rosters/student', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

    resultDiv.textContent = data.success ? `Student created with ID ${data.studentId}` : (data.message || 'Failed to create student');
}

// Create seating plan
async function handleCreateSeating(e) {
    e.preventDefault();
    const resultDiv = document.getElementById('seatingResult');
    resultDiv.textContent = '';

    const payload = {
        examId: document.getElementById('seatingExamSelect').value,
        planType: 'GRID',
        rows: Number(document.getElementById('seatingRows').value),
        columns: Number(document.getElementById('seatingColumns').value)
    };

    const data = await apiRequest('/seating', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

    resultDiv.textContent = data.success ? `Seating created with ${payload.rows * payload.columns} seats` : (data.message || 'Failed to create seating plan');
}

// Check-in with photo
async function handleCheckIn(e) {
    e.preventDefault();
    const resultDiv = document.getElementById('checkInResult');
    resultDiv.textContent = '';

    const examId = document.getElementById('checkInExamSelect').value;
    const studentId = document.getElementById('checkInStudentId').value;
    const actualSeat = document.getElementById('checkInSeat').value;
    const notes = document.getElementById('checkInNotes').value;
    const photoInput = document.getElementById('checkInPhoto');

    if (!photoInput.files.length) {
        resultDiv.textContent = 'Photo is required';
        return;
    }

    const formData = new FormData();
    formData.append('examId', examId);
    formData.append('studentId', studentId);
    if (actualSeat) formData.append('actualSeat', actualSeat);
    if (notes) formData.append('notes', notes);
    formData.append('photo', photoInput.files[0]);

    try {
        const response = await fetch(`${API_BASE_URL}/checkins`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            resultDiv.textContent = `Check-in recorded (${data.verification.result}, confidence ${data.verification.confidenceScore}%)`;
        } else {
            resultDiv.textContent = data.message || 'Check-in failed';
        }
    } catch (error) {
        console.error('Check-in error:', error);
        resultDiv.textContent = 'Network error';
    }
}

// Record violation
async function handleViolation(e) {
    e.preventDefault();
    const resultDiv = document.getElementById('violationResult');
    resultDiv.textContent = '';

    const formData = new FormData();
    formData.append('examId', document.getElementById('violationExamSelect').value);
    formData.append('studentId', document.getElementById('violationStudentId').value);
    formData.append('violationType', document.getElementById('violationCategory').value);
    formData.append('severity', document.getElementById('violationSeverity').value);
    formData.append('description', document.getElementById('violationReason').value);
    const evidence = document.getElementById('violationEvidence').files[0];
    if (evidence) formData.append('evidence', evidence);

    try {
        const response = await fetch(`${API_BASE_URL}/violations`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        });
        const data = await response.json();
        resultDiv.textContent = data.success ? 'Violation recorded' : (data.message || 'Failed to record violation');
    } catch (error) {
        console.error('Violation error:', error);
        resultDiv.textContent = 'Network error';
    }
}

// Reports
async function handleReport(type) {
    const examId = document.getElementById('reportExamSelect').value;
    const output = document.getElementById('reportOutput');
    output.textContent = 'Loading...';

    let endpoint = `/reports/${type}?examId=${examId}`;
    const data = await apiRequest(endpoint);
    output.textContent = data.success ? JSON.stringify(data.data || data, null, 2) : (data.message || 'Failed to load report');
}
