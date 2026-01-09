const { validateRequiredFields, validateEmail } = require('../src/utils/validation');

describe('Validation utilities', () => {
    test('detects missing required fields', () => {
        const { valid, missing } = validateRequiredFields({ a: 1, b: '' }, ['a', 'b', 'c']);
        expect(valid).toBe(false);
        expect(missing).toContain('b');
        expect(missing).toContain('c');
    });

    test('validates email format', () => {
        expect(validateEmail('test@example.com')).toBe(true);
        expect(validateEmail('invalid')).toBe(false);
    });
});
