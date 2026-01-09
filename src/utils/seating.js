/**
 * Seating utilities
 * Generates seats and validates seat assignments
 */

/**
 * Generate grid-based seats (rows x columns)
 * Seat codes follow A1, A2 ... B1, B2 ...
 * @param {number} rows
 * @param {number} columns
 * @returns {Array<{seat_code:string,row_number:number,column_number:number}>}
 */
function generateGridSeats(rows, columns) {
    if (!Number.isInteger(rows) || !Number.isInteger(columns) || rows <= 0 || columns <= 0) {
        throw new Error('Rows and columns must be positive integers');
    }

    const seats = [];
    for (let r = 0; r < rows; r++) {
        const rowCode = String.fromCharCode(65 + r); // A, B, C...
        for (let c = 1; c <= columns; c++) {
            seats.push({
                seat_code: `${rowCode}${c}`,
                row_number: r + 1,
                column_number: c
            });
        }
    }
    return seats;
}

/**
 * Validate a proposed seat assignment
 * @param {string} seatCode - seat being assigned/occupied
 * @param {Set<string>} validSeats - set of seat codes in the plan
 * @param {Set<string>} occupiedSeats - set of already assigned/occupied seats
 * @returns {{valid:boolean,message?:string}}
 */
function validateSeatAssignment(seatCode, validSeats, occupiedSeats = new Set()) {
    if (!seatCode) {
        return { valid: false, message: 'Seat code is required' };
    }
    if (!validSeats.has(seatCode)) {
        return { valid: false, message: `Seat ${seatCode} does not exist in this seating plan` };
    }
    if (occupiedSeats.has(seatCode)) {
        return { valid: false, message: `Seat ${seatCode} is already taken` };
    }
    return { valid: true };
}

module.exports = {
    generateGridSeats,
    validateSeatAssignment
};
