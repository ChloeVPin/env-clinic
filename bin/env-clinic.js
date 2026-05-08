#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { findEnvFiles } from '../src/finder.js';
import { parseEnvFile } from '../src/parser.js';
import { compareEnvs } from '../src/compare.js';
import { printReport } from '../src/reporter.js';
import { fixMissing, pruneExtra } from '../src/fixer.js';
import { isInteractive } from '../src/tty.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(resolve(__dirname, '..', 'package.json'), 'utf-8'));

export async function run(options = {}) {
    try {
        validateWriteOptions(options);

        const { envPath, examplePath } = findEnvFiles({
            envPath: options.file,
            examplePath: options.example,
        });

        const env = parseEnvFile(envPath);
        const example = parseEnvFile(examplePath);
        const result = compareEnvs(env.keys, example.keys);

        printReport(result, {
            ci: options.ci,
            quiet: options.quiet,
            json: options.json,
            strict: options.strict,
            fix: options.fix,
            prune: options.prune,
        });

        const shouldFix = options.fix ||
            (
                !options.ci &&
                !options.json &&
                isInteractive() &&
                result.missing.length > 0 &&
                await confirmAction('  Would you like to fill in missing variables now? [y/N] ')
            );

        if (shouldFix && result.missing.length > 0) {
            await fixMissing(result.missing, envPath, example.keys);
        }

        const shouldPrune = options.prune ||
            (
                !options.ci &&
                !options.json &&
                isInteractive() &&
                result.extra.length > 0 &&
                await confirmAction('  Would you like to remove extra variables now? [y/N] ')
            );

        if (shouldPrune && result.extra.length > 0) {
            await pruneExtra(result.extra, envPath);
        }

        const hasErrors = result.missing.length > 0;
        const strictErrors = options.strict && result.empty.length > 0;

        return hasErrors || strictErrors ? 1 : 0;
    } catch (err) {
        if (!options.json) {
            console.error('');
            console.error('  env-clinic error:');
            console.error(`  ${err.message}`);
            console.error('');
        } else {
            console.error(JSON.stringify({ error: err.message }, null, 2));
        }
        return 1;
    }
}

export function parseArgs(argv) {
    const options = {};

    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];

        if (arg === '-v' || arg === '--version') {
            return { earlyExitCode: 0, output: pkg.version };
        }

        if (arg === '-h' || arg === '--help') {
            return { earlyExitCode: 0, output: helpText() };
        }

        if (arg === '--file' || arg === '--example') {
            const value = argv[i + 1];
            if (!value || value.startsWith('--')) {
                throw new Error(`${arg} requires a path.`);
            }
            options[arg.slice(2)] = value;
            i += 1;
            continue;
        }

        if (arg.startsWith('--file=')) {
            options.file = arg.slice('--file='.length);
            continue;
        }

        if (arg.startsWith('--example=')) {
            options.example = arg.slice('--example='.length);
            continue;
        }

        if (['--fix', '--prune', '--ci', '--strict', '--quiet', '--json'].includes(arg)) {
            options[arg.slice(2)] = true;
            continue;
        }

        throw new Error(`Unknown option: ${arg}`);
    }

    return { options };
}

function validateWriteOptions(options) {
    if (!options.fix && !options.prune) {
        return;
    }

    if (options.ci) {
        throw new Error('--fix and --prune cannot be used with --ci.');
    }

    if (options.json) {
        throw new Error('--fix and --prune cannot be used with --json.');
    }

    if (!isInteractive()) {
        throw new Error('--fix and --prune require an interactive terminal.');
    }
}

async function confirmAction(question) {
    const { createInterface } = await import('node:readline');
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim().toLowerCase() === 'y');
        });
    });
}

function helpText() {
    return [
        'Usage: env-clinic [options]',
        '',
        'Zero-config CLI to find missing, extra, and empty variables in your .env file',
        '',
        'Options:',
        '  --file <path>      Path to the .env file (default: .env)',
        '  --example <path>   Path to the reference file (default: auto-detect)',
        '  --fix              Fill in missing variables interactively',
        '  --prune            Remove extra variables interactively',
        '  --ci               Non-interactive CI mode with plain text and no colors',
        '  --strict           Treat empty variables as errors',
        '  --quiet            Only show errors and warnings',
        '  --json             Output results as JSON',
        '  -v, --version      Show version number',
        '  -h, --help         Show help information',
    ].join('\n');
}

if (process.argv[1] && resolve(process.argv[1]) === __filename) {
    try {
        const parsed = parseArgs(process.argv.slice(2));
        if (parsed.output) {
            console.log(parsed.output);
            process.exit(parsed.earlyExitCode);
        }

        const code = await run(parsed.options);
        if (code !== 0) {
            process.exit(code);
        }
    } catch (err) {
        console.error('');
        console.error('  env-clinic error:');
        console.error(`  ${err.message}`);
        console.error('');
        process.exit(1);
    }
}
