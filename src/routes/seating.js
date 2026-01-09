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
            return res.json({ success: true, plans: [], seats: [] });
        }

        const seatingPlanIds = plans.map(p => p.seating_plan_id);
        const [seats] = await pool.query(
            `SELECT * FROM seats WHERE seating_plan_id IN (?) ORDER BY row_number, column_number`,
            [seatingPlanIds]
        );

        res.json({ success: true, plans, seats });
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
        const { examId, planName, planType, rows, columns, seatCodes } = req.body;
        if (!examId || !planType) {
            return res.status(400).json({ success: false, message: 'examId and planType are required' });
        }

        const type = planType.toUpperCase();
        if (!['GRID', 'SEAT_CODES'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Invalid planType' });
        }

        let seats = [];
        if (type === 'GRID') {
            seats = generateGridSeats(Number(rows), Number(columns));
        } else if (Array.isArray(seatCodes)) {
            seats = seatCodes.map(code => ({
                seat_code: String(code).trim(),
                row_number: null,
                column_number: null
            })).filter(s => s.seat_code);
            if (seats.length === 0) {
                return res.status(400).json({ success: false, message: 'seatCodes cannot be empty' });
            }
        }

        const totalSeats = seats.length;

        const [planResult] = await pool.query(
            `INSERT INTO seating_plans (exam_id, plan_name, plan_type, rows, columns, total_seats, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                examId,
                planName || 'Default Seating Plan',
                type,
                type === 'GRID' ? rows : null,
                type === 'GRID' ? columns : null,
                totalSeats,
                req.user.userId
            ]
        );

        const planId = planResult.insertId;
        if (seats.length > 0) {
            const values = seats.map(s => [
                planId,
                s.seat_code,
                s.row_number,
                s.column_number,
                false,
                null
            ]);
            await pool.query(
                `INSERT INTO seats (seating_plan_id, seat_code, row_number, column_number, is_occupied, occupied_by_student_id)
                 VALUES ?`,
                [values]
            );
        }

        await logAudit(req.user.userId, 'CREATE_SEATING_PLAN', 'SEATING_PLAN', planId, null, { planType: type }, req.ip);

        res.status(201).json({ success: true, seatingPlanId: planId, totalSeats });
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
            'SELECT exam_id FROM seating_plans WHERE seating_plan_id = ?',
            [planId]
        );
        if (planRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Seating plan not found' });
        }
        const examId = planRows[0].exam_id;

        const [seatRows] = await pool.query(
            'SELECT seat_code FROM seats WHERE seating_plan_id = ?',
            [planId]
        );
        const validSeats = new Set(seatRows.map(s => s.seat_code));

        // Track assigned seats to prevent duplicates in payload
        const assignedSeats = new Set();
        for (const a of assignments) {
            const validation = validateSeatAssignment(a.seatCode, validSeats, assignedSeats);
            if (!validation.valid) {
                return res.status(400).json({ success: false, message: validation.message });
            }
            assignedSeats.add(a.seatCode);
        }

        // Apply assignments
        for (const a of assignments) {
            await pool.query(
                `INSERT INTO exam_rosters (exam_id, student_id, assigned_seat)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE assigned_seat = VALUES(assigned_seat)`,
                [examId, a.studentId, a.seatCode]
            );

            await pool.query(
                `UPDATE seats SET is_occupied = TRUE, occupied_by_student_id = ?
                 WHERE seating_plan_id = ? AND seat_code = ?`,
                [a.studentId, planId, a.seatCode]
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
