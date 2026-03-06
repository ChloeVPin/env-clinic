<div align="center">
  <img src="assets/env-clinic.png" width="180" alt="env-clinic logo" />

  # env-clinic 🩺

  Catch missing `.env` variables before your app crashes.

  [![npm version](https://img.shields.io/npm/v/env-clinic)](https://www.npmjs.com/package/env-clinic)
  [![npm downloads](https://img.shields.io/npm/dw/env-clinic)](https://www.npmjs.com/package/env-clinic)
  [![License](https://img.shields.io/npm/l/env-clinic)](https://github.com/ChloeVPin/env-clinic/blob/master/LICENSE)
  [![CI](https://img.shields.io/github/actions/workflow/status/ChloeVPin/env-clinic/ci.yml?branch=master&label=CI)](https://github.com/ChloeVPin/env-clinic/actions)
  [![Node](https://img.shields.io/node/v/env-clinic)](https://www.npmjs.com/package/env-clinic)
</div>

---

## Why env-clinic?

You clone a repo. You run `npm install`. You run `npm start`. It crashes. 

Three environment variables are missing from your `.env` file but present in `.env.example`. You spend five minutes debugging a silent failure that should have been obvious. 

`env-clinic` catches this in one second. It's a zero-config CLI that diffs your environment files instantly, so you can stop guessing and start coding.

---

## 🚀 Usage

No install required. Just run it in your project root:

```bash
npx env-clinic
```

It automatically finds your `.env` and looks for an `.env.example` (or `.sample`, `.template`) to compare against.

---

## ✨ Output Example

`env-clinic` checks your `.env` for completeness and gives you a clear report:

```text
  ✅ DATABASE_URL        — present
  ❌ STRIPE_SECRET_KEY   — MISSING (in example but not in .env)
  ⚠️  OLD_REDIS_URL      — EXTRA (in .env but not in example)
  ⚠️  DEBUG_MODE         — EMPTY (present but has no value)
```

---

## 🛠️ The Fix Mode (`--fix`)

The killer feature is the interactive fix mode. Instead of manual copy-pasting, `env-clinic` help you fill in the blanks.

```bash
npx env-clinic --fix
```

It will prompt you for each missing variable and append it to your `.env` file safely.

---

## ⚙️ Options

| Flag | Description | Example |
|------|-------------|---------|
| `--fix` | Interactive mode to fill in missing variables. | `npx env-clinic --fix` |
| `--ci` | Plain text output for CI/CD pipelines (no colors/emojis). | `npx env-clinic --ci` |
| `--strict` | Treats empty variables as errors (exits 1). | `npx env-clinic --strict` |
| `--quiet` | Only shows errors and warnings. | `npx env-clinic --quiet` |
| `--file` | Custom path to your `.env` file. | `npx env-clinic --file .env.prod` |
| `--example` | Custom path to your reference file. | `npx env-clinic --example .env.sample` |
| `--json` | Output results as JSON for automation. | `npx env-clinic --json` |
| `--version` | Show the version number. | `npx env-clinic --version` |
| `--help` | Show help information. | `npx env-clinic --help` |

---

## 🛡️ CI/CD

Stop broken deployments. Add this to your CI workflow (e.g., GitHub Actions) to ensure all required secrets are present:

```yaml
- name: Check environment variables
  run: npx env-clinic --ci
```

`env-clinic` exits with `0` on match and `1` if anything is missing.

---

## 🔒 Security

**env-clinic reads only the KEYS from your .env file.** It never reads, prints, logs, or transmits your actual secret values. Your secrets stay on your machine.

---

## 🤝 Contributing

This is a tiny, focused tool built to solve one specific pain point. If you have a bug fix or a small improvement, feel free to open a PR!

- **Found a bug?** [Open an issue](https://github.com/ChloeVPin/env-clinic/issues)
- **Local Dev:** `npm install` and `npm test`
- **PRs:** Friendly pull requests are always welcome!

- [Contributing Guide](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

---

MIT License © 2026 ChloeVPin
