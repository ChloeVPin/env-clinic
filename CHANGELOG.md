# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2026-05-08

### Added
- Added support for `export KEY=value` lines in env files.
- Added direct tests for `--fix` and `--prune` file writes.
- Added CLI coverage for rejecting write modes with `--ci` and `--json`.

### Changed
- Write modes now require an interactive terminal and are blocked in CI, JSON, and non-interactive contexts.
- `--quiet` now suppresses tip lines.
- CLI output and docs now use plain labels instead of emoji markers.
- The npm package no longer ships image assets that are not needed at runtime.
- README security wording now accurately says values are read locally but never printed, transmitted, or stored.

## [1.3.0] - 2026-03-22

### Changed
- Clarified `--strict` and auto-prompt wording in the CLI help so empty values like `EMPTY=` are easier to understand.
- Added a CLI smoke test for strict mode to keep the public behavior locked down.
- Updated the README to call out Node 20+ support and the empty-value behavior explicitly.

## [1.2.0] - 2026-03-07

### Added
- Actionable error path: after reporting missing or extra variables, `env-clinic` now prints a contextual tip for `--fix` or `--prune`.
- Auto-prompt in interactive terminals: when running in a real TTY without `--fix` or `--prune`, `env-clinic` asks whether to fix or prune now. The default is always No.
- `src/tty.js`: new internal `isInteractive()` TTY-detection helper used to gate interactive prompts.

### Changed
- `printReport()` now accepts optional `fix` and `prune` booleans, used to suppress redundant tip lines when the relevant flag is already active.

### Security
- Interactive prompts are double-gated by `--ci` and `process.stdout.isTTY`.
- Default answer for prompts is No. No file is modified without explicit user confirmation.

## [1.1.0] - 2026-03-06

### Added
- `--prune` flag: interactive mode to remove extra variables from your `.env`. Asks `[y/N]` for each one before rewriting the file.
- `--fix` default values: when a missing key has a non-empty value in the example file, it is shown as a suggestion. Press Enter to accept it, or type your own.

## [1.0.0] - 2026-03-06

### Added
- Initial release of `env-clinic`.
- Zero-config `.env` vs `.env.example` comparison.
- Interactive `--fix` mode to safely append missing variables.
- Strict, CI, quiet, and JSON output modes.
- Support for custom `.env` and reference file paths.
- Proper exit codes for CI/CD integration.
