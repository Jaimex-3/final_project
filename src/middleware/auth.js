/**
 * Authentication Middleware
 * Handles JWT token validation and role-based access control
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'exam_security_secret_key_2026';

/**
 * Verify JWT token
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access token required' 
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                success: false, 
                message: 'Invalid or expired token' 
            });
        }
        req.user = user;
        next();
    });
}

/**
 * Check if user has required role
 */
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Insufficient permissions' 
            });
        }

        next();
    };
}

/**
 * Admin only access
 */
function requireAdmin(req, res, next) {
    return requireRole('ADMIN')(req, res, next);
}

/**
 * Proctor or Admin access
 */
function requireProctorOrAdmin(req, res, next) {
    return requireRole('PROCTOR', 'ADMIN')(req, res, next);
}

/**
 * Generate JWT token
 */
function generateToken(user) {
    const payload = {
        userId: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '30m' });
}

/**
 * Refresh token (extend expiration)
 */
function refreshToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        delete decoded.iat;
        delete decoded.exp;
        return jwt.sign(decoded, JWT_SECRET, { expiresIn: '30m' });
    } catch (error) {
        throw new Error('Invalid token');
    }
}

module.exports = {
    authenticateToken,
    requireRole,
    requireAdmin,
    requireProctorOrAdmin,
    generateToken,
    refreshToken,
    JWT_SECRET
};
