/**
 * Violation Routes
 * Handles violation recording and management
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const { pool } = require('../config/database');
const { authenticateToken, requireProctorOrAdmin, requireAdmin } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');
const fs = require('fs').promises;

const router = express.Router();

// Configure multer for evidence uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/violations');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `violation_${timestamp}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG and PNG images are allowed'));
        }
    }
});

// All routes require authentication
router.use(authenticateToken);
router.use(requireProctorOrAdmin);

/**
 * GET /api/violations/exam/:examId
 * Get all violations for an exam
 */
router.get('/exam/:examId', async (req, res) => {
    try {
        const { examId } = req.params;
        const { category, severity, status } = req.query;

        let query = `
            SELECT v.*, s.student_number, s.first_name, s.last_name,
                   reporter.username as reported_by_username, reporter.full_name as reported_by_name,
                   resolver.username as resolved_by_username
            FROM violations v
            JOIN students s ON v.student_id = s.student_id
            JOIN users reporter ON v.reported_by = reporter.user_id
            LEFT JOIN users resolver ON v.resolved_by = resolver.user_id
            WHERE v.exam_id = ?
        `;
        const params = [examId];

        if (category) {
            query += ' AND v.violation_type = ?';
            params.push(category);
        }

        if (severity) {
            query += ' AND v.severity = ?';
            params.push(severity);
        }

        if (status) {
            query += ' AND v.status = ?';
            params.push(status);
        }

        query += ' ORDER BY v.reported_at DESC';

        const [violations] = await pool.query(query, params);

        res.json({
            success: true,
            violations
        });
    } catch (error) {
        console.error('Get violations error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

/**
 * GET /api/violations/:id
 * Get violation by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [violations] = await pool.query(
            `SELECT v.*, s.student_number, s.first_name, s.last_name,
                    reporter.username as reported_by_username, reporter.full_name as reported_by_name,
                    resolver.username as resolved_by_username
             FROM violations v
             JOIN students s ON v.student_id = s.student_id
             JOIN users reporter ON v.reported_by = reporter.user_id
             LEFT JOIN users resolver ON v.resolved_by = resolver.user_id
             WHERE v.violation_id = ?`,
            [id]
        );

        if (violations.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Violation not found'
            });
        }

        res.json({
            success: true,
            violation: violations[0]
        });
    } catch (error) {
        console.error('Get violation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

/**
 * POST /api/violations
 * Record a new violation
 */
router.post('/', upload.single('evidence'), async (req, res) => {
    try {
        const {
            examId,
            studentId,
            violationType,
            description,
            severity,
            checkInId
        } = req.body;

        // Validate required fields
        if (!examId || !studentId || !violationType || !description || !severity) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Validate enums
        const validCategories = ['IDENTITY_MISMATCH', 'SEAT_MISMATCH', 'UNAUTHORIZED_MATERIALS', 
                                'DISRUPTIVE_BEHAVIOR', 'LATE_ARRIVAL', 'OTHER'];
        const validSeverities = ['LOW', 'MEDIUM', 'HIGH'];

        if (!validCategories.includes(violationType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid violation category'
            });
        }

        if (!validSeverities.includes(severity)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid severity level'
            });
        }

        // Store evidence path if uploaded
        let evidencePath = null;
        if (req.file) {
            evidencePath = path.relative(
                path.join(__dirname, '../..'),
                req.file.path
            );
        }

        // Insert violation
        const [result] = await pool.query(
            `INSERT INTO violations (check_in_id, exam_id, student_id, reported_by, violation_type, severity, description, evidence_photo_path, reported_at, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'RECORDED')`,
            [checkInId || null, examId, studentId, req.user.userId, violationType, severity, description, evidencePath]
        );

        // Log audit
        await logAudit(
            req.user.userId,
            'RECORD_VIOLATION',
            'VIOLATION',
            result.insertId,
            null,
            { studentId, examId, violationType, severity },
            req.ip
        );

        res.status(201).json({
            success: true,
            message: 'Violation recorded successfully',
            violationId: result.insertId
        });
    } catch (error) {
        console.error('Record violation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

/**
 * PATCH /api/violations/:id/status
 * Update violation status (Admin only)
 */
router.patch('/:id/status', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, resolutionNotes } = req.body;

        const validStatuses = ['RECORDED', 'REVIEWED', 'RESOLVED', 'DISMISSED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        // Get old status
        const [oldViolation] = await pool.query(
            'SELECT status FROM violations WHERE violation_id = ?',
            [id]
        );
        
        if (oldViolation.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Violation not found'
            });
        }

        // Update status/resolution
        await pool.query(
            `UPDATE violations 
             SET status = ?,
                 resolved_by = CASE WHEN ? IN ('RESOLVED','DISMISSED') THEN ? ELSE resolved_by END,
                 resolved_at = CASE WHEN ? IN ('RESOLVED','DISMISSED') THEN NOW() ELSE resolved_at END,
                 resolution_notes = COALESCE(?, resolution_notes)
             WHERE violation_id = ?`,
            [status, status, req.user.userId, status, resolutionNotes || null, id]
        );

        // Log audit
        await logAudit(
            req.user.userId,
            'UPDATE_VIOLATION_STATUS',
            'VIOLATION',
            id,
            { status: oldViolation[0].status },
            { status, resolutionNotes },
            req.ip
        );

        res.json({
            success: true,
            message: 'Violation status updated successfully'
        });
    } catch (error) {
        console.error('Update violation status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

/**
 * DELETE /api/violations/:id
 * Delete violation (Admin only)
 */
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Get violation
        const [violation] = await pool.query('SELECT * FROM violations WHERE violation_id = ?', [id]);
        
        if (violation.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Violation not found'
            });
        }

        // Delete violation
        await pool.query('DELETE FROM violations WHERE violation_id = ?', [id]);

        // Log audit
        await logAudit(
            req.user.userId,
            'DELETE_VIOLATION',
            'VIOLATION',
            id,
            violation[0],
            null,
            req.ip
        );

        res.json({
            success: true,
            message: 'Violation deleted successfully'
        });
    } catch (error) {
        console.error('Delete violation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
