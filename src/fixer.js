import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';

/**
 * Interactive fix mode: prompts the user for each missing key
 * and appends them to the .env file.
 *
 * SECURITY: Never displays existing values from .env.
 * Only writes new keys that were missing.
 *
 * @param {string[]} missingKeys - Array of missing key names
 * @param {string} envPath - Path to the .env file to append to
 * @param {Map<string,string>} exampleKeys - Parsed keys from the example file
 * @param {object} io - Optional input/output streams for tests
 */
export async function fixMissing(missingKeys, envPath, exampleKeys = new Map(), io = {}) {
    const {
        input = process.stdin,
        output = process.stdout,
        log = console.log,
    } = io;

    if (missingKeys.length === 0) {
        log('\n  Nothing to fix. All variables are present.\n');
        return;
    }

    const rl = createInterface({ input, output });

    const ask = (question) =>
        new Promise((resolve) => {
            rl.question(question, (answer) => resolve(answer));
        });

    log('');
    log('  env-clinic --fix');
    log('  Fill in missing variables. Press Enter to use the default or leave blank.');
    log('');

    const date = new Date().toISOString().slice(0, 10);
    const entries = [];

    for (const key of missingKeys) {
        const exampleDefault = exampleKeys.get(key) ?? '';
        const hint = exampleDefault ? ` [default: ${exampleDefault}]` : '';
        const answer = await ask(`  ${key}${hint} = `);
        const value = answer.trim() === '' ? exampleDefault : answer;
        entries.push(`${key}=${value}`);
    }

    rl.close();

    const block = `\n# Added by env-clinic on ${date}\n${entries.join('\n')}\n`;
    appendFileSync(envPath, block, 'utf-8');

    log('');
    log(`  ${entries.length} variable${entries.length === 1 ? '' : 's'} appended to ${envPath}`);
    log('');
}

/**
 * Interactive prune mode: asks the user whether to remove each EXTRA variable
 * and rewrites the .env file if any are confirmed.
 *
 * @param {string[]} extraKeys - Array of extra key names to consider removing
 * @param {string} envPath - Path to the .env file to rewrite
 * @param {object} io - Optional input/output streams for tests
 */
export async function pruneExtra(extraKeys, envPath, io = {}) {
    const {
        input = process.stdin,
        output = process.stdout,
        log = console.log,
    } = io;

    if (extraKeys.length === 0) {
        log('\n  Nothing to prune. No extra variables found.\n');
        return;
    }

    const rl = createInterface({ input, output });

    const ask = (question) =>
        new Promise((resolve) => {
            rl.question(question, (answer) => resolve(answer));
        });

    log('');
    log('  env-clinic --prune');
    log('  These variables are in your .env but not in your example file.');
    log('  Confirm which ones to remove: [y/N]');
    log('');

    const toRemove = new Set();

    for (const key of extraKeys) {
        const answer = await ask(`  ${key} remove? [y/N] `);
        if (answer.trim().toLowerCase() === 'y') {
            toRemove.add(key);
        }
    }

    rl.close();

    if (toRemove.size === 0) {
        log('');
        log('  No variables removed.');
        log('');
        return;
    }

    const content = readFileSync(envPath, 'utf-8');
    const lines = content.split(/\r?\n/);
    const filtered = lines.filter((line) => {
        const trimmed = line.trim();
        if (trimmed === '' || trimmed.startsWith('#')) return true;
        const key = trimmed.split('=')[0].trim();
        return !toRemove.has(key);
    });

    writeFileSync(envPath, filtered.join('\n'), 'utf-8');

    log('');
    log(`  Removed ${toRemove.size} variable${toRemove.size === 1 ? '' : 's'} from ${envPath}`);
    log('');
}
