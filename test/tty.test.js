import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

describe('isInteractive()', () => {
    test('returns a boolean', async () => {
        const { isInteractive } = await import('../src/tty.js');
        assert.strictEqual(typeof isInteractive(), 'boolean');
    });

    test('returns false when process.stdout.isTTY is undefined (pipe simulation)', async () => {
        const original = process.stdout.isTTY;
        try {
            Object.defineProperty(process.stdout, 'isTTY', {
                value: undefined,
                configurable: true,
                writable: true,
            });
            // Re-import via inline to pick up current process state
            const { isInteractive } = await import('../src/tty.js');
            // The module reads process.stdout.isTTY at call-time, not import-time
            assert.strictEqual(isInteractive(), false);
        } finally {
            Object.defineProperty(process.stdout, 'isTTY', {
                value: original,
                configurable: true,
                writable: true,
            });
        }
    });

    test('returns true when process.stdout.isTTY is true', async () => {
        const original = process.stdout.isTTY;
        try {
            Object.defineProperty(process.stdout, 'isTTY', {
                value: true,
                configurable: true,
                writable: true,
            });
            const { isInteractive } = await import('../src/tty.js');
            assert.strictEqual(isInteractive(), true);
        } finally {
            Object.defineProperty(process.stdout, 'isTTY', {
                value: original,
                configurable: true,
                writable: true,
            });
        }
    });
});
