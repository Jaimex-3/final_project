const { generateGridSeats, validateSeatAssignment } = require('../src/utils/seating');

describe('Seating utilities', () => {
    test('generateGridSeats builds correct codes', () => {
        const seats = generateGridSeats(2, 3);
        expect(seats).toHaveLength(6);
        expect(seats[0].seat_code).toBe('A1');
        expect(seats[2].seat_code).toBe('A3');
        expect(seats[3].seat_code).toBe('B1');
        expect(seats[5].seat_code).toBe('B3');
    });

    test('generateGridSeats rejects invalid input', () => {
        expect(() => generateGridSeats(0, 3)).toThrow();
        expect(() => generateGridSeats(-1, 3)).toThrow();
    });

    test('validateSeatAssignment enforces existence and duplicates', () => {
        const valid = new Set(['A1', 'A2']);
        const taken = new Set(['A1']);
        const ok = validateSeatAssignment('A2', valid, taken);
        expect(ok.valid).toBe(true);

        const missing = validateSeatAssignment('B5', valid, taken);
        expect(missing.valid).toBe(false);

        const dup = validateSeatAssignment('A1', valid, taken);
        expect(dup.valid).toBe(false);
    });
});
