import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { printReport } from '../src/reporter.js';

function captureOutput(fn) {
    const lines = [];
    const originalLog = console.log;
    console.log = (...args) => lines.push(args.join(' '));
    try {
        fn();
    } finally {
        console.log = originalLog;
    }
    return lines.join('\n');
}

describe('printReport existing behavior', () => {
    test('JSON output has no tip lines', () => {
        const result = {
            present: [],
            missing: ['DB_URL'],
            extra: [],
            empty: [],
            passed: false,
        };

        const output = captureOutput(() => printReport(result, { json: true }));
        assert.ok(!output.includes('Tip:'), 'JSON output must contain no tip lines');
        assert.ok(!output.includes('--fix'), 'JSON output must not mention --fix');
    });

    test('healthy env shows healthy message and no tips', () => {
        const result = {
            present: ['DB_URL', 'PORT'],
            missing: [],
            extra: [],
            empty: [],
            passed: true,
        };

        const output = captureOutput(() => printReport(result, {}));

        assert.ok(output.includes('healthy'), 'healthy message should be shown');
        assert.ok(!output.includes('Tip:'), 'no tips when everything is fine');
    });
});

describe('printReport actionable tip lines', () => {
    test('shows --fix tip when there are missing vars and --fix was not passed', () => {
        const result = {
            present: [],
            missing: ['SECRET_KEY'],
            extra: [],
            empty: [],
            passed: false,
        };

        const output = captureOutput(() => printReport(result, { fix: false }));

        assert.ok(output.includes('--fix'), 'should suggest --fix when vars are missing');
        assert.ok(output.includes('Tip:'), 'should include a tip label');
    });

    test('suppresses --fix tip when --fix flag is already active', () => {
        const result = {
            present: [],
            missing: ['SECRET_KEY'],
            extra: [],
            empty: [],
            passed: false,
        };

        const output = captureOutput(() => printReport(result, { fix: true }));

        assert.ok(!output.includes('--fix'), 'tip must be suppressed when --fix is already set');
    });

    test('shows --prune tip when there are extra vars and --prune was not passed', () => {
        const result = {
            present: ['DB_URL'],
            missing: [],
            extra: ['OLD_API_KEY'],
            empty: [],
            passed: true,
        };

        const output = captureOutput(() => printReport(result, { prune: false }));

        assert.ok(output.includes('--prune'), 'should suggest --prune when extra vars exist');
        assert.ok(output.includes('Tip:'), 'should include a tip label');
    });

    test('suppresses --prune tip when --prune flag is already active', () => {
        const result = {
            present: ['DB_URL'],
            missing: [],
            extra: ['OLD_API_KEY'],
            empty: [],
            passed: true,
        };

        const output = captureOutput(() => printReport(result, { prune: true }));

        assert.ok(!output.includes('--prune'), 'tip must be suppressed when --prune is already set');
    });

    test('shows both tips when both missing and extra vars exist', () => {
        const result = {
            present: [],
            missing: ['SECRET_KEY'],
            extra: ['OLD_KEY'],
            empty: [],
            passed: false,
        };

        const output = captureOutput(() => printReport(result, {}));

        assert.ok(output.includes('--fix'), 'should suggest --fix');
        assert.ok(output.includes('--prune'), 'should suggest --prune');
    });
});

describe('printReport tip suppression', () => {
    test('CI mode has no tip lines even when vars are missing', () => {
        const result = {
            present: [],
            missing: ['SECRET_KEY'],
            extra: ['OLD_KEY'],
            empty: [],
            passed: false,
        };

        const output = captureOutput(() => printReport(result, { ci: true }));

        assert.ok(!output.includes('Tip:'), 'CI mode must suppress tip lines');
        assert.ok(!output.includes('--fix'), 'CI mode must suppress --fix tip');
        assert.ok(!output.includes('--prune'), 'CI mode must suppress --prune tip');
    });

    test('JSON mode has no tip lines even when vars are missing', () => {
        const result = {
            present: [],
            missing: ['SECRET_KEY'],
            extra: ['OLD_KEY'],
            empty: [],
            passed: false,
        };

        const output = captureOutput(() => printReport(result, { json: true }));

        assert.ok(!output.includes('Tip:'), 'JSON mode must suppress tip lines');
        assert.ok(!output.includes('--fix'), 'JSON mode must suppress --fix tip');
        assert.ok(!output.includes('--prune'), 'JSON mode must suppress --prune tip');
    });

    test('quiet mode suppresses tips', () => {
        const result = {
            present: ['DB_URL'],
            missing: ['SECRET_KEY'],
            extra: [],
            empty: [],
            passed: false,
        };

        const output = captureOutput(() => printReport(result, { quiet: true }));

        assert.ok(!output.includes('--fix'), '--fix tip should be hidden in quiet mode');
        assert.ok(!output.includes('Tip:'), 'quiet mode should suppress tip labels');
    });
});
