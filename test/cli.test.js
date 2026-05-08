import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { run } from '../bin/env-clinic.js';

function makeTempProject(files) {
    const dir = mkdtempSync(join(tmpdir(), 'env-clinic-cli-'));
    for (const [name, content] of Object.entries(files)) {
        writeFileSync(join(dir, name), content, 'utf8');
    }
    return dir;
}

async function runInProject(cwd, options = {}) {
    const originalCwd = process.cwd();
    const logs = [];
    const errors = [];
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => logs.push(args.join(' '));
    console.error = (...args) => errors.push(args.join(' '));

    try {
        process.chdir(cwd);
        const code = await run(options);
        return {
            code,
            stdout: logs.join('\n'),
            stderr: errors.join('\n'),
        };
    } finally {
        process.chdir(originalCwd);
        console.log = originalLog;
        console.error = originalError;
    }
}

describe('CLI smoke test', () => {
    test('reports clean output for matching .env files', async () => {
        const dir = makeTempProject({
            '.env': 'DATABASE_URL=postgres://localhost/db\nPORT=3000\n',
            '.env.example': 'DATABASE_URL=postgres://localhost/db\nPORT=3000\n',
        });

        try {
            const result = await runInProject(dir, { ci: true });
            assert.equal(result.code, 0);
            assert.match(result.stdout, /All variables match/);
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
    });

    test('returns json for machine parsing', async () => {
        const dir = makeTempProject({
            '.env': 'DATABASE_URL=postgres://localhost/db\nPORT=3000\n',
            '.env.example': 'DATABASE_URL=postgres://localhost/db\nPORT=3000\nSECRET_KEY=\n',
        });

        try {
            const result = await runInProject(dir, { json: true });
            assert.equal(result.code, 1);
            const parsed = JSON.parse(result.stdout);
            assert.deepEqual(parsed.missing, ['SECRET_KEY']);
            assert.equal(parsed.passed, false);
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
    });

    test('fails when .env is missing', async () => {
        const dir = makeTempProject({
            '.env.example': 'DATABASE_URL=postgres://localhost/db\n',
        });

        try {
            const result = await runInProject(dir, { ci: true });
            assert.equal(result.code, 1);
            assert.match(result.stderr, /Could not find \.env/);
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
    });

    test('fails in strict mode when a required variable is empty', async () => {
        const dir = makeTempProject({
            '.env': 'DATABASE_URL=postgres://localhost/db\nEMPTY=\n',
            '.env.example': 'DATABASE_URL=postgres://localhost/db\nEMPTY=required\n',
        });

        try {
            const result = await runInProject(dir, { ci: true, strict: true });
            assert.equal(result.code, 1);
            assert.match(result.stdout, /EMPTY/);
            assert.match(result.stdout, /treated as error/);
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
    });

    test('rejects write mode with CI output', async () => {
        const dir = makeTempProject({
            '.env': 'A=1\n',
            '.env.example': 'A=1\nB=\n',
        });

        try {
            const result = await runInProject(dir, { ci: true, fix: true });
            assert.equal(result.code, 1);
            assert.match(result.stderr, /cannot be used with --ci/);
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
    });

    test('rejects write mode with JSON output', async () => {
        const dir = makeTempProject({
            '.env': 'A=1\n',
            '.env.example': 'A=1\nB=\n',
        });

        try {
            const result = await runInProject(dir, { json: true, fix: true });
            assert.equal(result.code, 1);
            const parsed = JSON.parse(result.stderr);
            assert.match(parsed.error, /cannot be used with --json/);
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
    });
});
