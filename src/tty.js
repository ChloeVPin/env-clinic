/**
 * TTY detection helper.
 *
 * Keeping this isolated makes it trivially mockable in tests
 * without touching any other module.
 */

/**
 * Returns true if stdout is an interactive terminal (TTY).
 * Returns false in CI runners, pipes, or when stdout is redirected.
 *
 * SECURITY: This guard ensures interactive prompts are NEVER triggered
 * inside non-interactive environments (CI, pipes, scripts).
 *
 * @returns {boolean}
 */
export function isInteractive() {
    return Boolean(process.stdout.isTTY);
}
