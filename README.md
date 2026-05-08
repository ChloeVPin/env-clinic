<h1 align="center">
  <a href="https://www.npmjs.com/package/env-clinic">
    <img src="https://raw.githubusercontent.com/ChloeVPin/env-clinic/master/assets/env-clinic.png" width="200" alt="env-clinic logo" />
  </a>
  <br>
  env-clinic
</h1>

<p align="center">
  <strong>Catch missing <code>.env</code> variables before your app crashes.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/env-clinic">
    <img src="https://img.shields.io/npm/v/env-clinic?color=blue" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/env-clinic">
    <img src="https://img.shields.io/npm/dw/env-clinic?color=brightgreen" alt="downloads" />
  </a>
  <a href="https://github.com/ChloeVPin/env-clinic/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license" />
  </a>
  <a href="https://github.com/ChloeVPin/env-clinic/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/ChloeVPin/env-clinic/ci.yml?branch=master&label=CI" alt="CI" />
  </a>
  <a href="https://www.npmjs.com/package/env-clinic">
    <img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg" alt="node version" />
  </a>
</p>

---

## Why

`env-clinic` compares your `.env` file with `.env.example`, `.env.sample`, or `.env.template` and reports missing, extra, and empty variables.

It is zero config and meant to stay small.

---

## Usage

Run it in your project root:

```bash
npx env-clinic
```

It automatically checks `.env` against the first reference file it can find.

Requires Node.js 20 or newer.

---

## Output

```text
  [PASS] DATABASE_URL        - present
  [FAIL] STRIPE_SECRET_KEY   - MISSING (in example but not in .env)
  [WARN] OLD_REDIS_URL       - EXTRA (in .env but not in example)
  [WARN] DEBUG_MODE          - EMPTY (present but has no value)

  Tip: run with --fix to fill these in interactively.
```

---

## Fix and prune

In an interactive terminal, `env-clinic` can ask if you want to fix missing variables or prune extras after the report.

You can also run the write modes directly:

```bash
npx env-clinic --fix
npx env-clinic --prune
```

Write modes are interactive only. They are rejected with `--ci`, `--json`, or non-interactive output.

---

## Options

| Flag | Description | Example |
|------|-------------|---------|
| `--fix` | Fill in missing variables interactively. Shows example defaults as suggestions. | `npx env-clinic --fix` |
| `--prune` | Remove extra variables interactively. | `npx env-clinic --prune` |
| `--ci` | Plain text output for CI/CD pipelines. | `npx env-clinic --ci` |
| `--strict` | Treat empty variables as errors. | `npx env-clinic --strict` |
| `--quiet` | Only show errors, warnings, and summary. | `npx env-clinic --quiet` |
| `--file` | Custom path to your `.env` file. | `npx env-clinic --file .env.prod` |
| `--example` | Custom path to your reference file. | `npx env-clinic --example .env.sample` |
| `--json` | Output results as JSON for automation. | `npx env-clinic --json` |
| `--version` | Show the version number. | `npx env-clinic --version` |
| `--help` | Show help information. | `npx env-clinic --help` |

---

## CI/CD

Add this to CI to fail when required variables are missing:

```yaml
- name: Check environment variables
  run: npx env-clinic --ci
```

`env-clinic` exits with `0` on match and `1` if required variables are missing. With `--strict`, empty variables also exit with `1`.

---

## Security

`env-clinic` reads local `.env` content so it can compare keys and detect empty values. It does not print, log, transmit, or store your secret values.

---

## Contributing

This is a tiny, focused tool. Bug fixes and small improvements are welcome.

- Found a bug? [Open an issue](https://github.com/ChloeVPin/env-clinic/issues)
- Local dev: `npm install` and `npm test`
- PRs: keep changes small and focused

- [Contributing Guide](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

---

MIT License (c) 2026 ChloeVPin
