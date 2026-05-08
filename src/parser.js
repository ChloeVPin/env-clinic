import { readFileSync } from 'node:fs';

/**
 * Parse a .env file into a Map of key/value entries.
 * Handles:
 *  - Comments
 *  - Blank lines
 *  - Quoted values
 *  - Values containing = signs
 *  - Keys with empty values
 *  - Optional export prefix
 *  - CRLF line endings
 *
 * @param {string} filePath - Absolute or relative path to the .env file
 * @returns {{ keys: Map<string, string>, order: string[] }}
 */
export function parseEnvFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  return parseEnvContent(content);
}

/**
 * Parse raw .env content string into a Map of key/value entries.
 *
 * @param {string} content - Raw file content
 * @returns {{ keys: Map<string, string>, order: string[] }}
 */
export function parseEnvContent(content) {
  const keys = new Map();
  const order = [];

  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  for (const rawLine of lines) {
    let line = rawLine.trim();

    if (line === '' || line.startsWith('#')) {
      continue;
    }

    if (line.startsWith('export ')) {
      line = line.slice('export '.length).trimStart();
    }

    const eqIndex = line.indexOf('=');

    let key;
    let value;

    if (eqIndex === -1) {
      key = line.trim();
      value = '';
    } else {
      key = line.slice(0, eqIndex).trim();
      value = line.slice(eqIndex + 1).trim();
    }

    if (key === '') {
      continue;
    }

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    keys.set(key, value);
    order.push(key);
  }

  return { keys, order };
}
