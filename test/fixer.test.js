import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, readFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Readable, Writable } from 'node:stream';
import { fixMissing, pruneExtra } from '../src/fixer.js';

function makeTempEnv(content) {
    const dir = join(tmpdir(), `env-clinic-test-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    mkdirSync(dir, { recursive: true });
    const filePath = join(dir, '.env');
    writeFileSync(filePath, content, 'utf-8');
    return { filePath, dir };
}

function ioFromAnswers(answers) {
    const outputChunks = [];
    return {
        input: Readable.from(answers.map((answer) => `${answer}\n`)),
        output: new Writable({
            write(chunk, encoding, callback) {
                outputChunks.push(chunk.toString());
                callback();
            },
        }),
        log() {},
        outputChunks,
    };
}

describe('fixMissing', () => {
    test('appends missing keys and uses example defaults when input is blank', async () => {
        const { filePath, dir } = makeTempEnv('EXISTING=value\n');

        try {
            await fixMissing(
                ['MISSING_KEY'],
                filePath,
                new Map([['MISSING_KEY', 'default_value']]),
                ioFromAnswers([''])
            );

            const result = readFileSync(filePath, 'utf-8');
            assert.match(result, /EXISTING=value/);
            assert.match(result, /# Added by env-clinic on \d{4}-\d{2}-\d{2}/);
            assert.match(result, /MISSING_KEY=default_value/);
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
    });

    test('appends user-provided values instead of defaults', async () => {
        const { filePath, dir } = makeTempEnv('EXISTING=value\n');

        try {
            await fixMissing(
                ['PORT'],
                filePath,
                new Map([['PORT', '3000']]),
                ioFromAnswers(['8080'])
            );

            const result = readFileSync(filePath, 'utf-8');
            assert.match(result, /PORT=8080/);
            assert.doesNotMatch(result, /PORT=3000/);
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
    });

    test('appends an empty value when no default is available', async () => {
        const { filePath, dir } = makeTempEnv('EXISTING=value\n');

        try {
            await fixMissing(
                ['SECRET_KEY'],
                filePath,
                new Map([['SECRET_KEY', '']]),
                ioFromAnswers([''])
            );

            const result = readFileSync(filePath, 'utf-8');
            assert.match(result, /SECRET_KEY=/);
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
    });
});

describe('pruneExtra', () => {
    test('removes confirmed keys and preserves the rest of the file', async () => {
        const envContent = [
            '# My env',
            'KEEP_THIS=hello',
            'REMOVE_THIS=world',
            'KEEP_TOO=foo',
        ].join('\n');

        const { filePath, dir } = makeTempEnv(envContent);

        try {
            await pruneExtra(['REMOVE_THIS'], filePath, ioFromAnswers(['y']));

            const result = readFileSync(filePath, 'utf-8');
            assert.match(result, /KEEP_THIS=hello/);
            assert.match(result, /KEEP_TOO=foo/);
            assert.doesNotMatch(result, /REMOVE_THIS/);
            assert.match(result, /# My env/);
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
    });

    test('keeps declined keys', async () => {
        const { filePath, dir } = makeTempEnv('KEEP=value\nOLD_KEY=oldvalue\n');

        try {
            await pruneExtra(['OLD_KEY'], filePath, ioFromAnswers(['']));

            const result = readFileSync(filePath, 'utf-8');
            assert.match(result, /KEEP=value/);
            assert.match(result, /OLD_KEY=oldvalue/);
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
    });
});
