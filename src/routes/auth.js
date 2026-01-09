/**
 * Authentication Routes
 * Handles login, logout, and session management
 */

const express = require('express');
const bcrypt = require('bcrypt');
const { pool } = require('../config/database');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');

const router = express.Router();

/**
 * POST /api/auth/login
 * User login
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Find user
        const [users] = await pool.query(
            'SELECT * FROM users WHERE username = ? AND is_active = TRUE',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const user = users[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Update last login
        await pool.query(
            'UPDATE users SET last_login = NOW() WHERE user_id = ?',
            [user.user_id]
        );

        // Log audit
        await logAudit(user.user_id, 'LOGIN', 'USER', user.user_id, null, null, req.ip);

        // Generate token
        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                userId: user.user_id,
                username: user.username,
                email: user.email,
                role: user.role,
                firstName: user.first_name,
                lastName: user.last_name
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

/**
 * POST /api/auth/logout
 * User logout (client-side token removal)
 */
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        // Log audit
        await logAudit(req.user.userId, 'LOGOUT', 'USER', req.user.userId, null, null, req.ip);

        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT user_id, username, email, role, first_name, last_name, is_active FROM users WHERE user_id = ?',
            [req.user.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                userId: users[0].user_id,
                username: users[0].username,
                email: users[0].email,
                role: users[0].role,
                firstName: users[0].first_name,
                lastName: users[0].last_name,
                isActive: users[0].is_active
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
