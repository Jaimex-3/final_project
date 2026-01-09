/**
 * Exam Management Routes
 * Handles exam CRUD operations
 */

const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/exams
 * Get all exams
 */
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = `
            SELECT e.*, u.username as created_by_username,
                   u.first_name as created_by_first_name,
                   u.last_name as created_by_last_name
            FROM exams e
            LEFT JOIN users u ON e.created_by = u.user_id
        `;
        const params = [];

        if (status) {
            query += ' WHERE e.status = ?';
            params.push(status);
        }

        query += ' ORDER BY e.exam_date DESC, e.exam_time DESC';

        const [exams] = await pool.query(query, params);

        res.json({
            success: true,
            exams
        });
    } catch (error) {
        console.error('Get exams error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

/**
 * GET /api/exams/:id
 * Get exam by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [exams] = await pool.query(
            `SELECT e.*, u.username as created_by_username,
                    u.first_name as created_by_first_name,
                    u.last_name as created_by_last_name
             FROM exams e
             LEFT JOIN users u ON e.created_by = u.user_id
             WHERE e.exam_id = ?`,
            [id]
        );

        if (exams.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        res.json({
            success: true,
            exam: exams[0]
        });
    } catch (error) {
        console.error('Get exam error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

/**
 * POST /api/exams
 * Create new exam (Admin only)
 */
router.post('/', requireAdmin, async (req, res) => {
    try {
        const {
            examCode,
            examName,
            examDate,
            examTime,
            roomLocation,
            durationMinutes,
            maxCapacity
        } = req.body;

        // Validate required fields
        if (!examCode || !examName || !examDate || !examTime) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check if exam code already exists
        const [existing] = await pool.query(
            'SELECT exam_id FROM exams WHERE exam_code = ?',
            [examCode]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Exam code already exists'
            });
        }

        // Insert exam
        const [result] = await pool.query(
            `INSERT INTO exams (exam_code, exam_name, exam_date, exam_time, room_location, 
                               duration_minutes, max_capacity, status, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?)`,
            [examCode, examName, examDate, examTime, roomLocation, durationMinutes, maxCapacity, req.user.userId]
        );

        // Log audit
        await logAudit(
            req.user.userId,
            'CREATE_EXAM',
            'EXAM',
            result.insertId,
            null,
            { examCode, examName, status: 'DRAFT' },
            req.ip
        );

        res.status(201).json({
            success: true,
            message: 'Exam created successfully',
            examId: result.insertId
        });
    } catch (error) {
        console.error('Create exam error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

/**
 * PUT /api/exams/:id
 * Update exam (Admin only)
 */
router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            examCode,
            examName,
            examDate,
            examTime,
            roomLocation,
            durationMinutes,
            maxCapacity,
            status
        } = req.body;

        // Get old values
        const [oldExam] = await pool.query('SELECT * FROM exams WHERE exam_id = ?', [id]);
        
        if (oldExam.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        // Update exam
        await pool.query(
            `UPDATE exams 
             SET exam_code = ?, exam_name = ?, exam_date = ?, exam_time = ?,
                 room_location = ?, duration_minutes = ?, max_capacity = ?, status = ?
             WHERE exam_id = ?`,
            [examCode, examName, examDate, examTime, roomLocation, durationMinutes, maxCapacity, status, id]
        );

        // Log audit
        await logAudit(
            req.user.userId,
            'UPDATE_EXAM',
            'EXAM',
            id,
            oldExam[0],
            { examCode, examName, examDate, examTime, status },
            req.ip
        );

        res.json({
            success: true,
            message: 'Exam updated successfully'
        });
    } catch (error) {
        console.error('Update exam error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

/**
 * DELETE /api/exams/:id
 * Delete exam (Admin only)
 */
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if exam exists
        const [exam] = await pool.query('SELECT * FROM exams WHERE exam_id = ?', [id]);
        
        if (exam.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        // Delete exam (cascade will delete related records)
        await pool.query('DELETE FROM exams WHERE exam_id = ?', [id]);

        // Log audit
        await logAudit(
            req.user.userId,
            'DELETE_EXAM',
            'EXAM',
            id,
            exam[0],
            null,
            req.ip
        );

        res.json({
            success: true,
            message: 'Exam deleted successfully'
        });
    } catch (error) {
        console.error('Delete exam error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

/**
 * PATCH /api/exams/:id/status
 * Update exam status (Admin only)
 */
router.patch('/:id/status', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        // Get old status
        const [oldExam] = await pool.query('SELECT status FROM exams WHERE exam_id = ?', [id]);
        
        if (oldExam.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        // Update status
        await pool.query('UPDATE exams SET status = ? WHERE exam_id = ?', [status, id]);

        // Log audit
        await logAudit(
            req.user.userId,
            'UPDATE_EXAM_STATUS',
            'EXAM',
            id,
            { status: oldExam[0].status },
            { status },
            req.ip
        );

        res.json({
            success: true,
            message: 'Exam status updated successfully'
        });
    } catch (error) {
        console.error('Update exam status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
