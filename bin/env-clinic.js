#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { findEnvFiles } from '../src/finder.js';
import { parseEnvFile } from '../src/parser.js';
import { compareEnvs } from '../src/compare.js';
import { printReport } from '../src/reporter.js';
import { fixMissing, pruneExtra } from '../src/fixer.js';
import { isInteractive } from '../src/tty.js';

// Read version from package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(resolve(__dirname, '..', 'package.json'), 'utf-8'));

const program = new Command();

program
    .name('env-clinic')
    .description('Zero-config CLI to find missing, extra, and empty variables in your .env file')
    .version(pkg.version, '-v, --version')
    .option('--file <path>', 'Path to the .env file (default: .env)')
    .option('--example <path>', 'Path to the reference file (default: auto-detect)')
    .option('--fix', 'Interactive mode — prompt to fill in missing variables (or auto-prompt in a terminal)')
    .option('--prune', 'Interactive mode — remove EXTRA variables from your .env (or auto-prompt in a terminal)')
    .option('--ci', 'Non-interactive CI mode — plain text, no colors')
    .option('--strict', 'Treat empty variables (for example EMPTY=) as errors')
    .option('--quiet', 'Only show errors and warnings')
    .option('--json', 'Output results as JSON')
    .action(async (options) => {
        try {
            // 1. Find files
            const { envPath, examplePath } = findEnvFiles({
                envPath: options.file,
                examplePath: options.example,
            });

            // 2. Parse both files
            const env = parseEnvFile(envPath);
            const example = parseEnvFile(examplePath);

            // 3. Compare
            const result = compareEnvs(env.keys, example.keys);

            // 4. Report
            printReport(result, {
                ci: options.ci,
                quiet: options.quiet,
                json: options.json,
                strict: options.strict,
                fix: options.fix,
                prune: options.prune,
            });

            // 5. Fix mode — explicit flag OR auto-prompt in interactive terminal.
            //    SECURITY: gated by both --ci flag and process.stdout.isTTY.
            //    Default answer is N — no file is ever modified without explicit 'y'.
            const shouldFix = options.fix ||
                (
                    !options.ci &&
                    !options.json &&
                    isInteractive() &&
                    result.missing.length > 0 &&
                    await confirmAction('  ❓ Would you like to fill in missing variables now? [y/N] ')
                );

            if (shouldFix && result.missing.length > 0) {
                await fixMissing(result.missing, envPath, example.keys);
            }

            // 6. Prune mode — explicit flag OR auto-prompt in interactive terminal.
            //    Same double-gate as above.
            const shouldPrune = options.prune ||
                (
                    !options.ci &&
                    !options.json &&
                    isInteractive() &&
                    result.extra.length > 0 &&
                    await confirmAction('  ❓ Would you like to remove extra variables now? [y/N] ')
                );

            if (shouldPrune && result.extra.length > 0) {
                await pruneExtra(result.extra, envPath);
            }

            // 7. Exit code
            const hasErrors = result.missing.length > 0;
            const strictErrors = options.strict && result.empty.length > 0;

            if (hasErrors || strictErrors) {
                process.exit(1);
            }
        } catch (err) {
            if (!options.json) {
                console.error('');
                console.error(`  🩺 env-clinic error:`);
                console.error(`  ${err.message}`);
                console.error('');
            } else {
                console.error(JSON.stringify({ error: err.message }, null, 2));
            }
            process.exit(1);
        }
    });

program.parse();

/**
 * Prompts a single [y/N] confirmation question on stdin.
 * Returns true only if the user explicitly types 'y' or 'Y'.
 * The default (pressing Enter with no input) is No — safe by design.
 *
 * SECURITY: This helper is only ever called after checking isInteractive()
 * and confirming the relevant flag (--ci, --json) is not set.
 *
 * @param {string} question
 * @returns {Promise<boolean>}
 */
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
