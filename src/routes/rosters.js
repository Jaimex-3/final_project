/**
 * Roster Management Routes
 * Supports CSV import and manual student entry
 */

const express = require('express');
const multer = require('multer');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin, requireProctorOrAdmin } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');

const router = express.Router();

// Multer for CSV uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'));
        }
    }
});

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/rosters/exam/:examId
 * List roster for an exam
 */
router.get('/exam/:examId', requireProctorOrAdmin, async (req, res) => {
    try {
        const { examId } = req.params;
        const [rows] = await pool.query(
            `SELECT er.roster_id, er.assigned_seat, s.student_id, s.student_number,
                    s.first_name, s.last_name, s.email, s.phone, s.enrollment_year, s.major,
                    s.registered_photo_path
             FROM exam_rosters er
             JOIN students s ON er.student_id = s.student_id
             WHERE er.exam_id = ?
             ORDER BY s.student_number`,
            [examId]
        );

        res.json({ success: true, roster: rows });
    } catch (error) {
        console.error('Get roster error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

/**
 * POST /api/rosters/student
 * Manually add a student (Admin)
 */
router.post('/student', requireAdmin, async (req, res) => {
    try {
        const { studentNumber, firstName, lastName, email, phone, enrollmentYear, major, registeredPhotoPath } = req.body;
        if (!studentNumber || !firstName || !lastName) {
            return res.status(400).json({ success: false, message: 'Missing required student fields' });
        }

        // Check duplicate student_number
        const [existing] = await pool.query(
            'SELECT student_id FROM students WHERE student_number = ?',
            [studentNumber]
        );
        if (existing.length > 0) {
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
 * POST /api/rosters/exam/:examId/student
 * Add an existing student to an exam roster
 */
router.post('/exam/:examId/student', requireAdmin, async (req, res) => {
    try {
        const { examId } = req.params;
        const { studentId, assignedSeat } = req.body;
        if (!studentId) {
            return res.status(400).json({ success: false, message: 'studentId is required' });
        }

        await pool.query(
            `INSERT INTO exam_rosters (exam_id, student_id, assigned_seat)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE assigned_seat = VALUES(assigned_seat)`,
            [examId, studentId, assignedSeat || null]
        );

        await logAudit(req.user.userId, 'ADD_STUDENT_TO_ROSTER', 'EXAM_ROSTER', null, null, { examId, studentId, assignedSeat }, req.ip);

        res.json({ success: true, message: 'Student added to roster' });
    } catch (error) {
        console.error('Add roster student error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

/**
 * DELETE /api/rosters/exam/:examId/student/:studentId
 * Remove student from roster
 */
router.delete('/exam/:examId/student/:studentId', requireAdmin, async (req, res) => {
    try {
        const { examId, studentId } = req.params;
        await pool.query(
            'DELETE FROM exam_rosters WHERE exam_id = ? AND student_id = ?',
            [examId, studentId]
        );
        await logAudit(req.user.userId, 'REMOVE_STUDENT_FROM_ROSTER', 'EXAM_ROSTER', null, null, { examId, studentId }, req.ip);
        res.json({ success: true, message: 'Student removed from roster' });
    } catch (error) {
        console.error('Remove roster student error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

/**
 * POST /api/rosters/import
 * Import students via CSV and attach to an exam roster (Admin)
 * CSV header example: StudentID,FirstName,LastName,Email,Phone,EnrollmentYear,Major
 */
router.post('/import', requireAdmin, upload.single('file'), async (req, res) => {
    try {
        const { examId } = req.body;
        if (!examId) {
            return res.status(400).json({ success: false, message: 'examId is required' });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'CSV file is required' });
        }

        const content = req.file.buffer.toString('utf-8').trim();
        const lines = content.split(/\r?\n/).filter(Boolean);
        if (lines.length <= 1) {
            return res.status(400).json({ success: false, message: 'CSV contains no data rows' });
        }

        const header = lines.shift().split(',').map(h => h.trim().toLowerCase());
        const requiredHeaders = ['studentid', 'firstname', 'lastname'];
        const missing = requiredHeaders.filter(h => !header.includes(h));
        if (missing.length > 0) {
            return res.status(400).json({ success: false, message: `Missing CSV columns: ${missing.join(', ')}` });
        }

        let inserted = 0;
        let duplicates = 0;
        for (const line of lines) {
            if (!line.trim()) continue;
            const cols = line.split(',').map(c => c.trim());
            const record = Object.fromEntries(header.map((h, idx) => [h, cols[idx] || '']));
            const studentNumber = record.studentid;
            const firstName = record.firstname;
            const lastName = record.lastname;

            if (!studentNumber || !firstName || !lastName) {
                continue; // skip invalid row
            }

            const [existing] = await pool.query(
                'SELECT student_id FROM students WHERE student_number = ?',
                [studentNumber]
            );

            let studentId;
            if (existing.length > 0) {
                duplicates += 1;
                studentId = existing[0].student_id;
            } else {
                const [result] = await pool.query(
                    `INSERT INTO students (student_number, first_name, last_name, email, phone, enrollment_year, major)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        studentNumber,
                        firstName,
                        lastName,
                        record.email || null,
                        record.phone || null,
                        record.enrollmentyear || null,
                        record.major || null
                    ]
                );
                studentId = result.insertId;
                inserted += 1;
            }

            // add to roster if not already
            await pool.query(
                `INSERT IGNORE INTO exam_rosters (exam_id, student_id)
                 VALUES (?, ?)`,
                [examId, studentId]
            );
        }

        await logAudit(
            req.user.userId,
            'IMPORT_ROSTER',
            'EXAM_ROSTER',
            examId,
            null,
            { inserted, duplicates },
            req.ip
        );

        res.json({
            success: true,
            message: 'Roster import completed',
            inserted,
            duplicates
        });
    } catch (error) {
        console.error('Import roster error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
