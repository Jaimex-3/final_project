/**
 * Audit Logging Utility
 * Logs all significant system events
 */

const { pool } = require('../config/database');

/**
 * Log an audit event
 * 
 * @param {number} userId - ID of user performing action
 * @param {string} action - Action performed
 * @param {string} entityType - Type of entity affected
 * @param {number} entityId - ID of entity affected
 * @param {object} oldValue - Previous value (optional)
 * @param {object} newValue - New value (optional)
 * @param {string} ipAddress - IP address of user
 */
async function logAudit(userId, action, entityType, entityId, oldValue, newValue, ipAddress) {
    try {
        await pool.query(
            `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_value, new_value, ip_address)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                userId || null,
                action,
                entityType || null,
                entityId || null,
                oldValue ? JSON.stringify(oldValue) : null,
                newValue ? JSON.stringify(newValue) : null,
                ipAddress || null
            ]
        );
    } catch (error) {
        console.error('Audit log error:', error);
        // Don't throw error - audit logging should not break main functionality
    }
}

/**
 * Get audit logs with filters
 * 
 * @param {object} filters - Filter criteria
 * @returns {array} Array of audit log entries
 */
async function getAuditLogs(filters = {}) {
    try {
        let query = `
            SELECT al.*, u.username, u.first_name, u.last_name
            FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.user_id
            WHERE 1=1
        `;
        const params = [];

        if (filters.userId) {
            query += ' AND al.user_id = ?';
            params.push(filters.userId);
        }

        if (filters.action) {
            query += ' AND al.action = ?';
            params.push(filters.action);
        }

        if (filters.entityType) {
            query += ' AND al.entity_type = ?';
            params.push(filters.entityType);
        }

        if (filters.entityId) {
            query += ' AND al.entity_id = ?';
            params.push(filters.entityId);
        }

        if (filters.startDate) {
            query += ' AND al.timestamp >= ?';
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            query += ' AND al.timestamp <= ?';
            params.push(filters.endDate);
        }

        query += ' ORDER BY al.timestamp DESC LIMIT ?';
        params.push(filters.limit || 100);

        const [logs] = await pool.query(query, params);
        return logs;
    } catch (error) {
        console.error('Get audit logs error:', error);
        throw error;
    }
}

module.exports = {
    logAudit,
    getAuditLogs
};
