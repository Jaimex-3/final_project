/**
 * Exam Security System - Main Server
 * Express.js application entry point
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const examRoutes = require('./routes/exams');
const checkInRoutes = require('./routes/checkins');
const violationRoutes = require('./routes/violations');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/checkins', checkInRoutes);
app.use('/api/violations', violationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Exam Security System API is running',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Exam Security System API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            exams: '/api/exams',
            checkins: '/api/checkins',
            violations: '/api/violations',
            health: '/api/health'
        }
    });
});

// Serve frontend for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            message: 'File upload error: ' + err.message
        });
    }
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// Start server
async function startServer() {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.error('⚠️  Warning: Database connection failed. Server starting anyway...');
        }

        app.listen(PORT, () => {
            console.log('='.repeat(60));
            console.log('  Exam Security System - Server Started');
            console.log('='.repeat(60));
            console.log(`  🚀 Server running on port ${PORT}`);
            console.log(`  🌐 API URL: http://localhost:${PORT}/api`);
            console.log(`  📊 Health Check: http://localhost:${PORT}/api/health`);
            console.log(`  🔐 Login: http://localhost:${PORT}/login`);
            console.log('='.repeat(60));
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the server
startServer();

module.exports = app;
