/**
 * Seating Plan Routes
 * Create seating plans and manage seat assignments
 */

const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin, requireProctorOrAdmin } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');
const { generateGridSeats, validateSeatAssignment } = require('../utils/seating');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/seating/exam/:examId
 * Get seating plans and seats for an exam
 */
router.get('/exam/:examId', requireProctorOrAdmin, async (req, res) => {
    try {
        const { examId } = req.params;

        const [plans] = await pool.query(
            'SELECT * FROM seating_plans WHERE exam_id = ?',
            [examId]
        );

        if (plans.length === 0) {
            return res.json({ success: true, plans: [], assignments: [] });
        }

        const planIds = plans.map(p => p.seating_plan_id);
        const [assignments] = await pool.query(
            `SELECT sa.*, s.student_number, s.first_name, s.last_name
             FROM seat_assignments sa
             JOIN students s ON sa.student_id = s.student_id
             WHERE sa.seating_plan_id IN (?)
             ORDER BY sa.row_number, sa.column_number`,
            [planIds]
        );

        res.json({ success: true, plans, assignments });
    } catch (error) {
        console.error('Get seating error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

/**
 * POST /api/seating
 * Create a seating plan (Admin only)
 * For GRID plan_type, rows/columns required and seats auto-created
 * For SEAT_CODES plan_type, pass seatCodes array
 */
router.post('/', requireAdmin, async (req, res) => {
    try {
        const { examId, planName, planType, rows, columns, roomId } = req.body;
        if (!examId || !planType) {
            return res.status(400).json({ success: false, message: 'examId and planType are required' });
        }

        const type = planType.toUpperCase();
        if (!['GRID', 'CUSTOM'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Invalid planType' });
        }

        if (type === 'GRID' && (!rows || !columns)) {
            return res.status(400).json({ success: false, message: 'rows and columns are required for GRID layout' });
        }

        const [planResult] = await pool.query(
            `INSERT INTO seating_plans (exam_id, room_id, total_rows, total_columns, layout_type, created_by)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                examId,
                roomId || null,
                type === 'GRID' ? rows : null,
                type === 'GRID' ? columns : null,
                type,
                req.user.userId
            ]
        );

        await logAudit(req.user.userId, 'CREATE_SEATING_PLAN', 'SEATING_PLAN', planResult.insertId, null, { planType: type }, req.ip);

        res.status(201).json({ success: true, seatingPlanId: planResult.insertId });
    } catch (error) {
        console.error('Create seating error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

/**
 * POST /api/seating/:planId/assignments
 * Bulk assign students to seats (Admin)
 * Body: { assignments: [{studentId, seatCode}] }
 */
router.post('/:planId/assignments', requireAdmin, async (req, res) => {
    try {
        const { planId } = req.params;
        const { assignments } = req.body;
        if (!Array.isArray(assignments) || assignments.length === 0) {
            return res.status(400).json({ success: false, message: 'assignments array required' });
        }

        const [planRows] = await pool.query(
            'SELECT exam_id, total_rows, total_columns, layout_type FROM seating_plans WHERE seating_plan_id = ?',
            [planId]
        );
        if (planRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Seating plan not found' });
        }
        const { exam_id: examId, total_rows, total_columns, layout_type } = planRows[0];

        let validSeats = null;
        if (layout_type === 'GRID' && total_rows && total_columns) {
            validSeats = new Set(generateGridSeats(Number(total_rows), Number(total_columns)).map(s => s.seat_code));
        }

        // Track assigned seats to prevent duplicates in payload
        const assignedSeats = new Set();
        for (const a of assignments) {
            if (!a.studentId || !a.seatCode) {
                return res.status(400).json({ success: false, message: 'studentId and seatCode are required for each assignment' });
            }
            if (validSeats) {
                const validation = validateSeatAssignment(a.seatCode, validSeats, assignedSeats);
                if (!validation.valid) {
                    return res.status(400).json({ success: false, message: validation.message });
                }
            }
            assignedSeats.add(a.seatCode);
        }

        // Apply assignments: update roster and seat_assignments
        for (const a of assignments) {
            await pool.query(
                `INSERT INTO exam_rosters (exam_id, student_id, assigned_seat)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE assigned_seat = VALUES(assigned_seat)`,
                [examId, a.studentId, a.seatCode]
            );

            // Derive row/column for grid; leave null otherwise
            let rowNumber = null;
            let colNumber = null;
            if (layout_type === 'GRID' && typeof a.seatCode === 'string') {
                const match = a.seatCode.match(/^([A-Z]+)(\d+)$/i);
                if (match) {
                    rowNumber = match[1].toUpperCase().charCodeAt(0) - 64;
                    colNumber = Number(match[2]);
                }
            }

            await pool.query(
                `INSERT INTO seat_assignments (seating_plan_id, student_id, seat_code, row_number, column_number)
                 VALUES (?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE seat_code = VALUES(seat_code), row_number = VALUES(row_number), column_number = VALUES(column_number)`,
                [planId, a.studentId, a.seatCode, rowNumber, colNumber]
            );
        }

        await logAudit(
            req.user.userId,
            'ASSIGN_SEATS',
            'SEATING_PLAN',
            planId,
            null,
            { assignments: assignments.length },
            req.ip
        );

        res.json({ success: true, message: 'Seat assignments updated' });
    } catch (error) {
        console.error('Assign seats error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
