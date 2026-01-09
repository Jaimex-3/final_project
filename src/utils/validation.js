/**
 * Simple validation helpers
 */

function validateRequiredFields(payload, fields) {
    const missing = fields.filter(f => !payload[f]);
    return {
        valid: missing.length === 0,
        missing
    };
}

function validateEmail(email) {
    if (!email) return true;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

module.exports = {
    validateRequiredFields,
    validateEmail
};
