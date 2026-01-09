/**
 * Reporting Routes
 * Provide check-in, mismatch, violation, and summary reports
 */

const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireProctorOrAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);
router.use(requireProctorOrAdmin);

/**
 * GET /api/reports/checkins?examId=#
 */
router.get('/checkins', async (req, res) => {
    try {
        const { examId } = req.query;
        if (!examId) {
            return res.status(400).json({ success: false, message: 'examId is required' });
        }

        const [rows] = await pool.query(
            `SELECT ci.*, s.student_number, s.first_name, s.last_name,
                    u.username as proctor_username
             FROM check_ins ci
             JOIN students s ON ci.student_id = s.student_id
             JOIN users u ON ci.proctor_id = u.user_id
             WHERE ci.exam_id = ?
             ORDER BY ci.check_in_time DESC`,
            [examId]
        );

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Check-in report error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

/**
 * GET /api/reports/mismatches?examId=#
 * Combines seat mismatches and identity mismatches
 */
router.get('/mismatches', async (req, res) => {
    try {
        const { examId } = req.query;
        if (!examId) {
            return res.status(400).json({ success: false, message: 'examId is required' });
        }

        const [rows] = await pool.query(
            `SELECT ci.check_in_id, ci.student_id, ci.exam_id, ci.check_in_time,
                    ci.verification_result, ci.confidence_score, ci.assigned_seat, ci.actual_seat, ci.seat_match,
                    s.student_number, s.first_name, s.last_name
             FROM check_ins ci
             JOIN students s ON ci.student_id = s.student_id
             WHERE ci.exam_id = ?
             AND (ci.verification_result = 'NO_MATCH' OR ci.seat_match = FALSE)`,
            [examId]
        );

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Mismatch report error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

/**
 * GET /api/reports/violations?examId=#
 */
router.get('/violations', async (req, res) => {
    try {
        const { examId } = req.query;
        if (!examId) {
            return res.status(400).json({ success: false, message: 'examId is required' });
        }

        const [rows] = await pool.query(
            `SELECT v.*, s.student_number, s.first_name, s.last_name
             FROM violations v
             JOIN students s ON v.student_id = s.student_id
             WHERE v.exam_id = ?
             ORDER BY v.reported_at DESC`,
            [examId]
        );

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Violation report error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

/**
 * GET /api/reports/summary?examId=#
 */
router.get('/summary', async (req, res) => {
    try {
        const { examId } = req.query;
        if (!examId) {
            return res.status(400).json({ success: false, message: 'examId is required' });
        }

        const [[counts]] = await pool.query(
            `SELECT 
                (SELECT COUNT(*) FROM exam_rosters er WHERE er.exam_id = ?) as rosterCount,
                (SELECT COUNT(*) FROM check_ins ci WHERE ci.exam_id = ?) as checkIns,
                (SELECT COUNT(*) FROM check_ins ci WHERE ci.exam_id = ? AND ci.verification_result = 'NO_MATCH') as identityMismatches,
                (SELECT COUNT(*) FROM violations v WHERE v.exam_id = ?) as violations
             `,
            [examId, examId, examId, examId]
        );

        const noShows = counts.rosterCount - counts.checkIns;
        const compliance = counts.rosterCount === 0 ? 0 : Math.round(((counts.checkIns - counts.identityMismatches) / counts.rosterCount) * 100);

        res.json({
            success: true,
            data: {
                roster: counts.rosterCount,
                checkIns: counts.checkIns,
                noShows,
                identityMismatches: counts.identityMismatches,
                violations: counts.violations,
                compliance
            }
        });
    } catch (error) {
        console.error('Summary report error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
