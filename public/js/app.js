/**
 * Exam Security System - Frontend Application
 */

const API_BASE_URL = '/api';
let currentUser = null;
let authToken = null;

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
            if (data.exams.length === 0) {
                examsList.innerHTML = '<div class="empty-state"><p>No exams found</p></div>';
            } else {
                examsList.innerHTML = data.exams.map(exam => `
                    <div class="exam-card">
                        <h4>${exam.exam_name}</h4>
                        <p><strong>Code:</strong> ${exam.exam_code}</p>
                        <p><strong>Date:</strong> ${formatDate(exam.exam_date)}</p>
                        <p><strong>Time:</strong> ${exam.exam_time}</p>
                        <p><strong>Location:</strong> ${exam.room_location || 'N/A'}</p>
                        <p><strong>Duration:</strong> ${exam.duration_minutes} minutes</p>
                        <p><strong>Capacity:</strong> ${exam.max_capacity}</p>
                        <span class="exam-status status-${exam.status.toLowerCase()}">${exam.status}</span>
                    </div>
                `).join('');
            }
        } else {
            examsList.innerHTML = '<div class="error-message">Failed to load exams</div>';
        }
    } catch (error) {
        console.error('Load exams error:', error);
        examsList.innerHTML = '<div class="error-message">Network error</div>';
    }
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
