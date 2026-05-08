import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { parseEnvContent } from '../src/parser.js';

describe('parseEnvContent', () => {
    test('parses simple key=value pairs', () => {
        const content = 'DATABASE_URL=postgres://localhost/db\nPORT=3000';
        const { keys, order } = parseEnvContent(content);

        assert.equal(keys.get('DATABASE_URL'), 'postgres://localhost/db');
        assert.equal(keys.get('PORT'), '3000');
        assert.deepEqual(order, ['DATABASE_URL', 'PORT']);
    });

    test('ignores comments and blank lines', () => {
        const content = '# This is a comment\n\nKEY=value\n\n# Another comment\nKEY2=value2';
        const { keys } = parseEnvContent(content);

        assert.equal(keys.size, 2);
        assert.equal(keys.has('#'), false);
        assert.equal(keys.get('KEY'), 'value');
        assert.equal(keys.get('KEY2'), 'value2');
    });

    test('handles double-quoted values', () => {
        const content = 'KEY="hello world"';
        const { keys } = parseEnvContent(content);
        assert.equal(keys.get('KEY'), 'hello world');
    });

    test('handles single-quoted values', () => {
        const content = "KEY='hello world'";
        const { keys } = parseEnvContent(content);
        assert.equal(keys.get('KEY'), 'hello world');
    });

    test('handles values with = signs in them', () => {
        const content = 'DATABASE_URL=postgres://user:pass@host/db?ssl=true&pool=5';
        const { keys } = parseEnvContent(content);
        assert.equal(keys.get('DATABASE_URL'), 'postgres://user:pass@host/db?ssl=true&pool=5');
    });

    test('handles keys with empty values (KEY=)', () => {
        const content = 'EMPTY_KEY=\nANOTHER=';
        const { keys } = parseEnvContent(content);

        assert.equal(keys.get('EMPTY_KEY'), '');
        assert.equal(keys.get('ANOTHER'), '');
    });

    test('handles keys with no = sign (bare keys)', () => {
        const content = 'BARE_KEY';
        const { keys } = parseEnvContent(content);
        assert.equal(keys.get('BARE_KEY'), '');
    });

    test('handles Windows-style CRLF line endings', () => {
        const content = 'KEY1=value1\r\nKEY2=value2\r\n';
        const { keys, order } = parseEnvContent(content);

        assert.equal(keys.get('KEY1'), 'value1');
        assert.equal(keys.get('KEY2'), 'value2');
        assert.deepEqual(order, ['KEY1', 'KEY2']);
    });

    test('handles empty file content', () => {
        const { keys, order } = parseEnvContent('');
        assert.equal(keys.size, 0);
        assert.deepEqual(order, []);
    });

    test('handles file with only comments', () => {
        const content = '# Comment 1\n# Comment 2\n# Comment 3';
        const { keys, order } = parseEnvContent(content);
        assert.equal(keys.size, 0);
        assert.deepEqual(order, []);
    });

    test('trims whitespace around keys and values', () => {
        const content = '  KEY  =  value  ';
        const { keys } = parseEnvContent(content);
        assert.equal(keys.get('KEY'), 'value');
    });

    test('handles export-prefixed keys', () => {
        const content = 'export DATABASE_URL=postgres://localhost/db\nexport EMPTY=';
        const { keys, order } = parseEnvContent(content);

        assert.equal(keys.get('DATABASE_URL'), 'postgres://localhost/db');
        assert.equal(keys.get('EMPTY'), '');
        assert.deepEqual(order, ['DATABASE_URL', 'EMPTY']);
    });

    test('preserves order of keys', () => {
        const content = 'Z_KEY=1\nA_KEY=2\nM_KEY=3';
        const { order } = parseEnvContent(content);
        assert.deepEqual(order, ['Z_KEY', 'A_KEY', 'M_KEY']);
    });

    test('last occurrence wins for duplicate keys', () => {
        const content = 'KEY=first\nKEY=second';
        const { keys } = parseEnvContent(content);
        assert.equal(keys.get('KEY'), 'second');
    });

    test('handles mixed line endings (CR, LF, CRLF)', () => {
        const content = 'A=1\rB=2\nC=3\r\nD=4';
        const { keys } = parseEnvContent(content);
        assert.equal(keys.size, 4);
        assert.equal(keys.get('A'), '1');
        assert.equal(keys.get('D'), '4');
    });
});
