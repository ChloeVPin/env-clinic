# env-clinic

Compare a project's .env file with a reference file and report missing, extra, or empty variables. Reports contain variable names, not their values.

## Start here

Requires Node.js 20 or newer. With no arguments, the CLI reads .env and the first reference file it finds: .env.example, .env.sample, then .env.template.

```sh
npx env-clinic
```

It checks presence and emptiness. It does not validate URLs, credentials, types, or whether a configured service can be reached.

## Use in scripts

```sh
npx env-clinic --ci --strict
npx env-clinic --file .env.production --example .env.example --json
```

Exit status is 1 when a required variable is missing, a file cannot be read or parsed, or the command fails. strict also fails for empty required values. Extra variables are warnings. json emits present, missing, extra, empty, and passed.

## Edit interactively

```sh
npx env-clinic --fix
npx env-clinic --prune
```

Both modes require terminal input and output. They collect answers before writing, cancel on early end-of-input, and stop if the file changes while questions are open. fix appends missing assignments. prune removes confirmed assignments while preserving unrelated content and line endings.

The parser accepts comments, export prefixes, single, double, and backtick quotes, and multiline quoted values. Variable references remain literal. A bare variable counts as empty, and the last assignment to a name wins.

## Options

| Option | Behavior |
| --- | --- |
| --file <path> | Read this environment file instead of .env. |
| --example <path> | Read this reference instead of searching. |
| --ci | Compare without prompting. |
| --json | Emit machine-readable results. |
| --strict | Treat empty required values as errors. |
| --quiet | Hide per-variable success lines. |
| --fix | Prompt for missing variables. |
| --prune | Prompt to remove extra variables. |

## Development

```sh
npm test
```

See CONTRIBUTING.md and CHANGELOG.md.

## License

MIT. See LICENSE.
