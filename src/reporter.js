/**
 * Print a colorized, human-friendly report to stdout.
 *
 * @param {object} result - Output from compareEnvs()
 * @param {object} options
 * @param {boolean} [options.ci] - Plain text output
 * @param {boolean} [options.quiet] - Only show errors and warnings
 * @param {boolean} [options.json] - Output JSON instead
 * @param {boolean} [options.strict] - Treat empty vars as errors
 * @param {boolean} [options.fix] - Was --fix already passed?
 * @param {boolean} [options.prune] - Was --prune already passed?
 */
export function printReport(result, options = {}) {
    const { present, missing, extra, empty, passed } = result;

    if (options.json) {
        const output = {
            present,
            missing,
            extra,
            empty,
            passed: options.strict ? passed && empty.length === 0 : passed,
        };
        console.log(JSON.stringify(output, null, 2));
        return;
    }

    console.log('');
    console.log('  env-clinic');
    console.log('  ---------------------------------');
    console.log('');

    if (!options.quiet) {
        for (const key of present) {
            console.log(`  [PASS] ${key}  - present`);
        }
    }

    for (const key of missing) {
        console.log(`  [FAIL] ${key}  - MISSING (in example but not in .env)`);
    }

    for (const key of extra) {
        console.log(`  [WARN] ${key}  - EXTRA (in .env but not in example)`);
    }

    for (const key of empty) {
        const label = options.strict ? '- EMPTY (strict mode: treated as error)' : '- EMPTY (present but has no value)';
        const icon = options.strict ? '[FAIL]' : '[WARN]';
        console.log(`  ${icon} ${key}  ${label}`);
    }

    console.log('');
    console.log('  ---------------------------------');
    console.log('  Summary:');

    if (present.length > 0) {
        console.log(`  [PASS] ${present.length} variable${present.length === 1 ? '' : 's'} present`);
    }
    if (missing.length > 0) {
        console.log(`  [FAIL] ${missing.length} variable${missing.length === 1 ? '' : 's'} missing`);
    }
    if (extra.length > 0) {
        console.log(`  [WARN] ${extra.length} extra variable${extra.length === 1 ? '' : 's'} (may be safe to remove)`);
    }
    if (empty.length > 0) {
        const emptyLabel = options.strict ? 'empty (treated as error)' : 'empty (present but has no value)';
        const emptyIcon = options.strict ? '[FAIL]' : '[WARN]';
        console.log(`  ${emptyIcon} ${empty.length} ${emptyLabel}`);
    }

    if (missing.length === 0 && extra.length === 0 && empty.length === 0) {
        console.log('  [PASS] All variables match. Your .env is healthy.');
    }

    if (!options.ci && !options.json && !options.quiet) {
        if (missing.length > 0 && !options.fix) {
            console.log('\n  Tip: run with --fix to fill these in interactively.');
        }
        if (extra.length > 0 && !options.prune) {
            console.log('  Tip: run with --prune to remove extra variables interactively.');
        }
    }

    console.log('');
}
