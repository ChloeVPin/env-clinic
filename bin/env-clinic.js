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
    .option('--fix', 'Interactive mode — prompt to fill in missing variables')
    .option('--prune', 'Interactive mode — remove EXTRA variables from your .env')
    .option('--ci', 'Non-interactive CI mode — plain text, no colors')
    .option('--strict', 'Treat empty variables as errors')
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
            });

            // 5. Fix mode — fill in missing variables
            if (options.fix && result.missing.length > 0) {
                await fixMissing(result.missing, envPath, example.keys);
            }

            // 6. Prune mode — remove extra variables
            if (options.prune && result.extra.length > 0) {
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
