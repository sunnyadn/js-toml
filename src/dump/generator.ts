import { DumpOptions } from './options.js';
import { isPlainObject } from '../common/utils.js';

interface NormalizedOptions {
  newline: '\n' | '\r\n';
  forceQuotes: boolean;
}

function normalize(options: DumpOptions): NormalizedOptions {
  return {
    newline: options.newline ?? '\n',
    forceQuotes: options.forceQuotes ?? false,
  };
}

const BARE_KEY_REGEX = /^[A-Za-z0-9_-]+$/;

function dumpKey(key: string, forceQuotes: boolean): string {
  if (!forceQuotes && BARE_KEY_REGEX.test(key)) return key;
  return dumpString(key);
}

const CHAR_ESCAPE_MAP: Record<string, string> = {
  '\\': '\\\\',
  '"': '\\"',
  '\b': '\\b',
  '\t': '\\t',
  '\n': '\\n',
  '\f': '\\f',
  '\r': '\\r',
};

// eslint-disable-next-line no-control-regex
const ESCAPE_REGEX = /["\\\x00-\x1F\x7F]/g;

function dumpString(str: string): string {
  const escaped = str.replace(ESCAPE_REGEX, (char) => {
    if (CHAR_ESCAPE_MAP[char]) return CHAR_ESCAPE_MAP[char];
    return `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;
  });
  return `"${escaped}"`;
}

function dumpNumber(num: number | bigint): string {
  if (typeof num === 'bigint') return num.toString();
  if (Number.isNaN(num)) return 'nan';
  if (num === Number.POSITIVE_INFINITY) return 'inf';
  if (num === Number.NEGATIVE_INFINITY) return '-inf';
  if (num === 0 && 1 / num === Number.NEGATIVE_INFINITY) return '-0.0';
  if (Number.isInteger(num)) return num.toString();

  const str = num.toString();
  if (!str.includes('.') && !str.includes('e') && !str.includes('E')) {
    return str + '.0';
  }
  return str;
}

function dumpDate(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    throw new Error('Cannot dump invalid Date');
  }
  return date.toISOString();
}

function dumpValue(value: unknown, opts: NormalizedOptions): string {
  if (typeof value === 'string') return dumpString(value);
  if (typeof value === 'number' || typeof value === 'bigint')
    return dumpNumber(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value instanceof Date) return dumpDate(value);
  if (Array.isArray(value)) return dumpInlineArray(value, opts);
  if (isPlainObject(value)) return dumpInlineTable(value, opts);
  throw new Error(`Unexpected value type during generation: ${typeof value}`);
}

function dumpInlineArray(arr: unknown[], opts: NormalizedOptions): string {
  return `[${arr.map((item) => dumpValue(item, opts)).join(', ')}]`;
}

function dumpInlineTable(obj: object, opts: NormalizedOptions): string {
  const pairs = Object.entries(obj).map(
    ([key, value]) =>
      `${dumpKey(key, opts.forceQuotes)} = ${dumpValue(value, opts)}`
  );
  return pairs.length === 0 ? '{}' : `{ ${pairs.join(', ')} }`;
}

function isTableArray(arr: unknown[]): arr is Record<string, unknown>[] {
  return arr.length > 0 && arr.every((v) => isPlainObject(v));
}

function hasRenderableHeader(val: Record<string, unknown>): boolean {
  const entries = Object.values(val);
  if (entries.length === 0) return true;
  return entries.some(
    (v) => !isPlainObject(v) && !(Array.isArray(v) && isTableArray(v))
  );
}

export function generateBase(
  obj: Record<string, unknown>,
  options: DumpOptions
): string {
  return generateTableBody(obj, [], normalize(options));
}

function generateTableBody(
  obj: Record<string, unknown>,
  pathPrefix: string[],
  opts: NormalizedOptions
): string {
  const { newline: nl, forceQuotes } = opts;

  const simplePairs: string[] = [];
  const nestedTables: { key: string; val: Record<string, unknown> }[] = [];
  const nestedArraysOfTables: {
    key: string;
    arr: Record<string, unknown>[];
  }[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value) && isTableArray(value)) {
      nestedArraysOfTables.push({ key, arr: value });
    } else if (isPlainObject(value)) {
      nestedTables.push({ key, val: value });
    } else {
      simplePairs.push(
        `${dumpKey(key, forceQuotes)} = ${dumpValue(value, opts)}`
      );
    }
  }

  const sections: string[] = [];

  if (simplePairs.length > 0) {
    sections.push(simplePairs.join(nl) + nl);
  }

  for (const { key, val } of nestedTables) {
    const fullPath = [...pathPrefix, dumpKey(key, forceQuotes)];
    let section = '';
    if (hasRenderableHeader(val)) {
      section += `[${fullPath.join('.')}]${nl}`;
    }
    section += generateTableBody(val, fullPath, opts);
    sections.push(section);
  }

  for (const { key, arr } of nestedArraysOfTables) {
    const fullPath = [...pathPrefix, dumpKey(key, forceQuotes)];
    for (const item of arr) {
      sections.push(
        `[[${fullPath.join('.')}]]${nl}` +
          generateTableBody(item, fullPath, opts)
      );
    }
  }

  return sections.join(nl);
}
