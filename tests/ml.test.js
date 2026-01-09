jest.mock('child_process', () => ({
    exec: (cmd, cb) => {
        // allow tests to override behavior
        if (global.__mlExecMock) {
            return global.__mlExecMock(cmd, cb);
        }
        cb(null, JSON.stringify({ success: true, confidence_score: 88.2, is_match: true }));
    }
}));

const { runVerification } = require('../src/utils/ml');

describe('ML verification wrapper', () => {
    afterEach(() => {
        global.__mlExecMock = null;
    });

    test('returns parsed result on success', async () => {
        const result = await runVerification('a.jpg', 'b.jpg');
        expect(result.success).toBe(true);
        expect(result.confidence_score).toBeCloseTo(88.2);
        expect(result.is_match).toBe(true);
    });

    test('handles exec errors gracefully', async () => {
        global.__mlExecMock = (cmd, cb) => cb(new Error('boom'), '');
        const result = await runVerification('a.jpg', 'b.jpg');
        expect(result.success).toBe(false);
        expect(result.confidence_score).toBe(0);
        expect(result.is_match).toBe(false);
    });

    test('handles parse errors', async () => {
        global.__mlExecMock = (cmd, cb) => cb(null, 'not-json');
        const result = await runVerification('a.jpg', 'b.jpg');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
    });
});
