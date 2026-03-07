# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-03-07

### Added
- **Actionable error path**: After reporting missing or extra variables, `env-clinic` now prints a contextual `💡 Tip: run with --fix / --prune` line to guide the user to the next step.
- **Auto-prompt in interactive terminals**: When running in a real TTY without `--fix` or `--prune`, `env-clinic` now asks `Would you like to fix/prune now? [y/N]` — default is always **No** (safe).
- `src/tty.js`: New internal `isInteractive()` TTY-detection helper used to gate all interactive prompts.

### Changed
- `printReport()` now accepts two new optional boolean options: `fix` and `prune`, used to suppress redundant tip lines when the relevant flag is already active.

### Security
- All new interactive prompts are double-gated: by the `--ci` flag AND by `process.stdout.isTTY`. Piped or CI environments will never see a hanging prompt.
- Default answer for all new prompts is `N` (No). No file is modified without explicit user confirmation.

## [1.1.0] - 2026-03-06

### Added
- `--prune` flag: Interactive mode to remove EXTRA variables from your `.env`. Asks `[y/N]` for each one before rewriting the file.
- `--fix` default values: When a missing key has a non-empty value in the example file (e.g. `PORT=3000`), it is shown as a suggestion. Press Enter to accept it, or type your own.

## [1.0.0] - 2026-03-06

### Added
- Initial release of `env-clinic`.
- Zero-config `.env` vs `.env.example` comparison.
- Interactive `--fix` mode to safely append missing variables.
- Strict, CI, quiet, and JSON output modes.
- Support for custom `.env` and reference file paths.
- Proper exit codes for CI/CD integration.
