/**
 * Authentication Tests
 * Tests for authentication middleware and token validation
 */

const jwt = require('jsonwebtoken');
const { generateToken, JWT_SECRET } = require('../src/middleware/auth');

describe('Authentication Tests', () => {
    describe('Token Generation', () => {
        test('should generate valid JWT token', () => {
            const user = {
                user_id: 1,
                username: 'testuser',
                email: 'test@example.com',
                role: 'ADMIN'
            };

            const token = generateToken(user);
            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
        });

        test('generated token should contain user information', () => {
            const user = {
                user_id: 1,
                username: 'testuser',
                email: 'test@example.com',
                role: 'ADMIN'
            };

            const token = generateToken(user);
            const decoded = jwt.verify(token, JWT_SECRET);

            expect(decoded.userId).toBe(user.user_id);
            expect(decoded.username).toBe(user.username);
            expect(decoded.email).toBe(user.email);
            expect(decoded.role).toBe(user.role);
        });

        test('token should have expiration time', () => {
            const user = {
                user_id: 1,
                username: 'testuser',
                email: 'test@example.com',
                role: 'ADMIN'
            };

            const token = generateToken(user);
            const decoded = jwt.verify(token, JWT_SECRET);

            expect(decoded.exp).toBeDefined();
            expect(decoded.exp).toBeGreaterThan(decoded.iat);
        });
    });

    describe('Token Validation', () => {
        test('should validate correct token', () => {
            const user = {
                user_id: 1,
                username: 'testuser',
                email: 'test@example.com',
                role: 'ADMIN'
            };

            const token = generateToken(user);
            const decoded = jwt.verify(token, JWT_SECRET);

            expect(decoded).toBeDefined();
            expect(decoded.userId).toBe(user.user_id);
        });

        test('should reject invalid token', () => {
            const invalidToken = 'invalid.token.here';

            expect(() => {
                jwt.verify(invalidToken, JWT_SECRET);
            }).toThrow();
        });

        test('should reject token with wrong secret', () => {
            const user = {
                user_id: 1,
                username: 'testuser',
                email: 'test@example.com',
                role: 'ADMIN'
            };

            const token = jwt.sign(user, 'wrong_secret');

            expect(() => {
                jwt.verify(token, JWT_SECRET);
            }).toThrow();
        });
    });

    describe('Role-Based Access Control', () => {
        test('admin role should be correctly encoded in token', () => {
            const adminUser = {
                user_id: 1,
                username: 'admin',
                email: 'admin@example.com',
                role: 'ADMIN'
            };

            const token = generateToken(adminUser);
            const decoded = jwt.verify(token, JWT_SECRET);

            expect(decoded.role).toBe('ADMIN');
        });

        test('proctor role should be correctly encoded in token', () => {
            const proctorUser = {
                user_id: 2,
                username: 'proctor',
                email: 'proctor@example.com',
                role: 'PROCTOR'
            };

            const token = generateToken(proctorUser);
            const decoded = jwt.verify(token, JWT_SECRET);

            expect(decoded.role).toBe('PROCTOR');
        });
    });
});
