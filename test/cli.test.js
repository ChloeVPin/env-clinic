import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const cliPath = resolve('bin', 'env-clinic.js');

function makeTempProject(files) {
    const dir = mkdtempSync(join(tmpdir(), 'env-clinic-cli-'));
    for (const [name, content] of Object.entries(files)) {
        writeFileSync(join(dir, name), content, 'utf8');
    }
    return dir;
}

function runCli(cwd, args = []) {
    return execFileSync(process.execPath, [cliPath, ...args], {
        cwd,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
    });
}

function runCliExpectFailure(cwd, args = []) {
    try {
        execFileSync(process.execPath, [cliPath, ...args], {
            cwd,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        return null;
    } catch (error) {
        return error;
    }
}

describe('CLI smoke test', () => {
    test('reports clean output for matching .env files', () => {
        const dir = makeTempProject({
            '.env': 'DATABASE_URL=postgres://localhost/db\nPORT=3000\n',
            '.env.example': 'DATABASE_URL=postgres://localhost/db\nPORT=3000\n',
        });

        try {
            const output = runCli(dir, ['--ci']);
            assert.match(output, /All variables match/);
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
    });

    test('returns json for machine parsing', () => {
        const dir = makeTempProject({
            '.env': 'DATABASE_URL=postgres://localhost/db\nPORT=3000\n',
            '.env.example': 'DATABASE_URL=postgres://localhost/db\nPORT=3000\nSECRET_KEY=\n',
        });

        try {
            const error = runCliExpectFailure(dir, ['--json']);
            assert.ok(error, 'json mode should exit non-zero when required variables are missing');
            const parsed = JSON.parse(error.stdout);
            assert.deepEqual(parsed.missing, ['SECRET_KEY']);
            assert.equal(parsed.passed, false);
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
    });

    test('fails when .env is missing', () => {
        const dir = makeTempProject({
            '.env.example': 'DATABASE_URL=postgres://localhost/db\n',
        });

        try {
            assert.throws(
                () => runCli(dir, ['--ci']),
                /Could not find \.env/
            );
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
    });

    test('fails in strict mode when a required variable is empty', () => {
        const dir = makeTempProject({
            '.env': 'DATABASE_URL=postgres://localhost/db\nEMPTY=\n',
            '.env.example': 'DATABASE_URL=postgres://localhost/db\nEMPTY=required\n',
        });

        try {
            const error = runCliExpectFailure(dir, ['--ci', '--strict']);
            assert.ok(error, 'strict mode should exit non-zero for empty variables');
            assert.match(error.stdout, /EMPTY/);
            assert.match(error.stdout, /treated as error/);
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
    });
});
