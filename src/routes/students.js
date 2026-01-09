/**
 * Student Management Routes
 * CRUD operations for students
 */

const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');

const router = express.Router();

router.use(authenticateToken);

/**
 * GET /api/students
 * List all students
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT student_id, student_number, first_name, last_name, email, phone, enrollment_year, major, registered_photo_path FROM students ORDER BY student_number'
        );
        res.json({ success: true, students: rows });
    } catch (error) {
        console.error('List students error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

/**
 * GET /api/students/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM students WHERE student_id = ?',
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.json({ success: true, student: rows[0] });
    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

/**
 * POST /api/students
 */
router.post('/', requireAdmin, async (req, res) => {
    try {
        const { studentNumber, firstName, lastName, email, phone, enrollmentYear, major, registeredPhotoPath } = req.body;
        if (!studentNumber || !firstName || !lastName) {
            return res.status(400).json({ success: false, message: 'studentNumber, firstName, lastName are required' });
        }

        const [dup] = await pool.query('SELECT student_id FROM students WHERE student_number = ?', [studentNumber]);
        if (dup.length > 0) {
            return res.status(409).json({ success: false, message: 'Student number already exists' });
        }

        const [result] = await pool.query(
            `INSERT INTO students (student_number, first_name, last_name, email, phone, enrollment_year, major, registered_photo_path)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [studentNumber, firstName, lastName, email || null, phone || null, enrollmentYear || null, major || null, registeredPhotoPath || null]
        );

        await logAudit(req.user.userId, 'CREATE_STUDENT', 'STUDENT', result.insertId, null, { studentNumber }, req.ip);
        res.status(201).json({ success: true, studentId: result.insertId });
    } catch (error) {
        console.error('Create student error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

/**
 * PUT /api/students/:id
 */
router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { studentNumber, firstName, lastName, email, phone, enrollmentYear, major, registeredPhotoPath } = req.body;
        const [existing] = await pool.query('SELECT * FROM students WHERE student_id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        await pool.query(
            `UPDATE students SET student_number = ?, first_name = ?, last_name = ?, email = ?, phone = ?, enrollment_year = ?, major = ?, registered_photo_path = ?
             WHERE student_id = ?`,
            [studentNumber || existing[0].student_number, firstName || existing[0].first_name, lastName || existing[0].last_name, email || null, phone || null, enrollmentYear || null, major || null, registeredPhotoPath || null, id]
        );

        await logAudit(req.user.userId, 'UPDATE_STUDENT', 'STUDENT', id, existing[0], { studentNumber, firstName, lastName }, req.ip);
        res.json({ success: true, message: 'Student updated' });
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

/**
 * DELETE /api/students/:id
 */
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const [existing] = await pool.query('SELECT * FROM students WHERE student_id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        await pool.query('DELETE FROM students WHERE student_id = ?', [id]);
        await logAudit(req.user.userId, 'DELETE_STUDENT', 'STUDENT', id, existing[0], null, req.ip);
        res.json({ success: true, message: 'Student deleted' });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
