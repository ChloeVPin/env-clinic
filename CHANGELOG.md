# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
