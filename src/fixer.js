import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';

/**
 * Interactive fix mode — prompts the user for each missing key
 * and appends them to the .env file.
 *
 * SECURITY: Never reads or displays existing values from .env.
 * Only writes new keys that were missing.
 *
 * @param {string[]}           missingKeys  - Array of missing key names
 * @param {string}             envPath      - Path to the .env file to append to
 * @param {Map<string,string>} exampleKeys  - Parsed keys from the example file (for defaults)
 */
export async function fixMissing(missingKeys, envPath, exampleKeys = new Map()) {
    if (missingKeys.length === 0) {
        console.log('\n  ✅ Nothing to fix — all variables are present!\n');
        return;
    }

    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const ask = (question) =>
        new Promise((resolve) => {
            rl.question(question, (answer) => resolve(answer));
        });

    console.log('');
    console.log('  🩺 env-clinic --fix');
    console.log('  Fill in missing variables (press Enter to use default or leave blank):');
    console.log('');

    const date = new Date().toISOString().slice(0, 10);
    const entries = [];

    for (const key of missingKeys) {
        const exampleDefault = exampleKeys.get(key) ?? '';
        const hint = exampleDefault ? ` [default: ${exampleDefault}]` : '';
        const answer = await ask(`  ❌ ${key}${hint} = `);
        const value = answer.trim() === '' ? exampleDefault : answer;
        entries.push(`${key}=${value}`);
    }

    rl.close();

    // Append to .env with a comment header
    const block = `\n# Added by env-clinic on ${date}\n${entries.join('\n')}\n`;
    appendFileSync(envPath, block, 'utf-8');

    console.log('');
    console.log(`  ✅ ${entries.length} variable${entries.length === 1 ? '' : 's'} appended to ${envPath}`);
    console.log('');
}

/**
 * Interactive prune mode — asks the user whether to remove each EXTRA variable
 * and rewrites the .env file if any are confirmed.
 *
 * @param {string[]} extraKeys - Array of extra key names to consider removing
 * @param {string}   envPath   - Path to the .env file to rewrite
 */
export async function pruneExtra(extraKeys, envPath) {
    if (extraKeys.length === 0) {
        console.log('\n  ✅ Nothing to prune — no extra variables found!\n');
        return;
    }

    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const ask = (question) =>
        new Promise((resolve) => {
            rl.question(question, (answer) => resolve(answer));
        });

    console.log('');
    console.log('  🩺 env-clinic --prune');
    console.log('  These variables are in your .env but not in your example file.');
    console.log('  Confirm which ones to remove: [y/N]');
    console.log('');

    const toRemove = new Set();

    for (const key of extraKeys) {
        const answer = await ask(`  ⚠️  ${key} — remove? [y/N] `);
        if (answer.trim().toLowerCase() === 'y') {
            toRemove.add(key);
        }
    }

    rl.close();

    if (toRemove.size === 0) {
        console.log('');
        console.log('  No variables removed.');
        console.log('');
        return;
    }

    // Rewrite .env, filtering out the confirmed keys
    const content = readFileSync(envPath, 'utf-8');
    const lines = content.split(/\r?\n/);
    const filtered = lines.filter((line) => {
        const trimmed = line.trim();
        if (trimmed === '' || trimmed.startsWith('#')) return true;
        const key = trimmed.split('=')[0].trim();
        return !toRemove.has(key);
    });

    // Avoid a trailing blank line duplication
    writeFileSync(envPath, filtered.join('\n'), 'utf-8');

    console.log('');
    console.log(`  ✅ Removed ${toRemove.size} variable${toRemove.size === 1 ? '' : 's'} from ${envPath}`);
    console.log('');
}
