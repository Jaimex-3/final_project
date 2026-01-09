/**
 * Check-In Routes
 * Handles student check-in workflow with photo verification
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const { pool } = require('../config/database');
const { authenticateToken, requireProctorOrAdmin } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');
const fs = require('fs').promises;
const { runVerification } = require('../utils/ml');
const { validateSeatAssignment } = require('../utils/seating');

const router = express.Router();

// Configure multer for photo uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/checkins');
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
        cb(null, `checkin_${timestamp}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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
 * GET /api/checkins/exam/:examId
 * Get all check-ins for an exam
 */
router.get('/exam/:examId', async (req, res) => {
    try {
        const { examId } = req.params;

        const [checkIns] = await pool.query(
            `SELECT ci.*, s.student_number, s.first_name, s.last_name, s.email,
                    u.username as proctor_username, u.first_name as proctor_first_name,
                    u.last_name as proctor_last_name
             FROM check_ins ci
             JOIN students s ON ci.student_id = s.student_id
             JOIN users u ON ci.proctor_id = u.user_id
             WHERE ci.exam_id = ?
             ORDER BY ci.check_in_timestamp DESC`,
            [examId]
        );

        res.json({
            success: true,
            checkIns
        });
    } catch (error) {
        console.error('Get check-ins error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

/**
 * GET /api/checkins/student/:examId/:studentId
 * Check if student is already checked in
 */
router.get('/student/:examId/:studentId', async (req, res) => {
    try {
        const { examId, studentId } = req.params;

        const [checkIns] = await pool.query(
            'SELECT * FROM check_ins WHERE exam_id = ? AND student_id = ?',
            [examId, studentId]
        );

        res.json({
            success: true,
            isCheckedIn: checkIns.length > 0,
            checkIn: checkIns.length > 0 ? checkIns[0] : null
        });
    } catch (error) {
        console.error('Check student check-in error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

/**
 * POST /api/checkins
 * Perform check-in with photo verification
 */
router.post('/', upload.single('photo'), async (req, res) => {
    try {
        const { examId, studentId, actualSeat, notes } = req.body;

        if (!examId || !studentId) {
            return res.status(400).json({
                success: false,
                message: 'Exam ID and Student ID are required'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Photo is required for check-in'
            });
        }

        // Check if student is in roster
        const [rosterEntry] = await pool.query(
            'SELECT * FROM exam_rosters WHERE exam_id = ? AND student_id = ?',
            [examId, studentId]
        );

        if (rosterEntry.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found in exam roster'
            });
        }

        // Check if already checked in
        const [existingCheckIn] = await pool.query(
            'SELECT * FROM check_ins WHERE exam_id = ? AND student_id = ?',
            [examId, studentId]
        );

        if (existingCheckIn.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Student already checked in'
            });
        }

        // Get student registered photo
        const [student] = await pool.query(
            'SELECT registered_photo_path FROM students WHERE student_id = ?',
            [studentId]
        );

        const capturedPhotoPath = req.file.path;
        const registeredPhotoPath = student[0].registered_photo_path;

        // Validate seat if provided
        if (actualSeat) {
            const [seatRows] = await pool.query(
                `SELECT seat_code FROM seats 
                 WHERE seat_code = ? AND seating_plan_id IN (
                    SELECT seating_plan_id FROM seating_plans WHERE exam_id = ?
                 )`,
                [actualSeat, examId]
            );
            const seatSet = new Set(seatRows.map(s => s.seat_code));
            const validation = validateSeatAssignment(actualSeat, seatSet);
            if (!validation.valid) {
                return res.status(400).json({ success: false, message: validation.message });
            }
        }

        // Perform ML verification
        let verificationResult = {
            success: false,
            confidence_score: 0,
            is_match: false
        };

        if (registeredPhotoPath && registeredPhotoPath !== '') {
            const fullRegisteredPath = path.join(__dirname, '../../', registeredPhotoPath);
            verificationResult = await runVerification(capturedPhotoPath, fullRegisteredPath);
        }

        // Determine verification result
        let verificationStatus = 'NO_MATCH';
        if (verificationResult.success && verificationResult.is_match) {
            verificationStatus = 'MATCH';
        }

        // Store relative path
        const relativePhotoPath = path.relative(
            path.join(__dirname, '../..'),
            capturedPhotoPath
        );

        // Insert check-in record
        const [result] = await pool.query(
            `INSERT INTO check_ins (exam_id, student_id, check_in_timestamp, captured_photo_path,
                                   verification_result, confidence_score, assigned_seat, actual_seat,
                                   proctor_id, notes)
             VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)`,
            [
                examId,
                studentId,
                relativePhotoPath,
                verificationStatus,
                verificationResult.confidence_score || 0,
                rosterEntry[0].assigned_seat,
                actualSeat || rosterEntry[0].assigned_seat,
                req.user.userId,
                notes || null
            ]
        );

        // Update seat occupation if seating plan exists
        if (actualSeat) {
            await pool.query(
                `UPDATE seats 
                 SET is_occupied = TRUE, occupied_by_student_id = ?
                 WHERE seat_code = ? AND seating_plan_id IN (
                     SELECT seating_plan_id FROM seating_plans WHERE exam_id = ?
                 )`,
                [studentId, actualSeat, examId]
            );
        }

        // Log audit
        await logAudit(
            req.user.userId,
            'CHECK_IN_STUDENT',
            'CHECK_IN',
            result.insertId,
            null,
            { studentId, examId, verificationStatus, confidenceScore: verificationResult.confidence_score },
            req.ip
        );

        // Check for seat mismatch and create violation if needed
        if (actualSeat && actualSeat !== rosterEntry[0].assigned_seat) {
            await pool.query(
                `INSERT INTO violations (exam_id, student_id, violation_category, violation_timestamp,
                                        reason, severity, proctor_id)
                 VALUES (?, ?, 'SEAT_MISMATCH', NOW(), ?, 'LOW', ?)`,
                [
                    examId,
                    studentId,
                    `Student sat in seat ${actualSeat} instead of assigned seat ${rosterEntry[0].assigned_seat}`,
                    req.user.userId
                ]
            );
        }

        // Check for identity mismatch and create violation if needed
        if (verificationStatus === 'NO_MATCH') {
            await pool.query(
                `INSERT INTO violations (exam_id, student_id, violation_category, violation_timestamp,
                                        reason, severity, evidence_image_path, proctor_id)
                 VALUES (?, ?, 'IDENTITY_MISMATCH', NOW(), ?, 'HIGH', ?, ?)`,
                [
                    examId,
                    studentId,
                    `Photo verification failed with confidence score ${verificationResult.confidence_score}%`,
                    relativePhotoPath,
                    req.user.userId
                ]
            );
        }

        res.status(201).json({
            success: true,
            message: 'Check-in completed successfully',
            checkInId: result.insertId,
            verification: {
                result: verificationStatus,
                confidenceScore: verificationResult.confidence_score,
                isMatch: verificationResult.is_match
            }
        });
    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

/**
 * PATCH /api/checkins/:id/override
 * Override verification result (manual approval)
 */
router.patch('/:id/override', async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        // Get check-in
        const [checkIn] = await pool.query('SELECT * FROM check_ins WHERE check_in_id = ?', [id]);
        
        if (checkIn.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Check-in not found'
            });
        }

        // Update to OVERRIDE
        await pool.query(
            'UPDATE check_ins SET verification_result = ?, notes = ? WHERE check_in_id = ?',
            ['OVERRIDE', notes || 'Manual override by proctor', id]
        );

        // Log audit
        await logAudit(
            req.user.userId,
            'OVERRIDE_VERIFICATION',
            'CHECK_IN',
            id,
            { verificationResult: checkIn[0].verification_result },
            { verificationResult: 'OVERRIDE' },
            req.ip
        );

        res.json({
            success: true,
            message: 'Verification result overridden successfully'
        });
    } catch (error) {
        console.error('Override verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
