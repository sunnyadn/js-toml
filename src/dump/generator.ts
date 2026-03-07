import { DumpOptions } from './options.js';
import { isPlainObject } from '../common/utils.js';

function isBareKey(key: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(key);
}

function dumpKey(key: string, forceQuotes: boolean): string {
  if (!forceQuotes && isBareKey(key)) {
    return key;
  }
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
    if (CHAR_ESCAPE_MAP[char]) {
      return CHAR_ESCAPE_MAP[char];
    }
    const code = char.charCodeAt(0);
    return `\\u${code.toString(16).padStart(4, '0')}`;
  });
  return `"${escaped}"`;
}

function dumpNumber(num: number | bigint): string {
  if (typeof num === 'bigint') {
    return num.toString();
  }
  if (Number.isNaN(num)) return 'nan';
  if (num === Number.POSITIVE_INFINITY) return 'inf';
  if (num === Number.NEGATIVE_INFINITY) return '-inf';

  // Check if it's explicitly -0
  if (num === 0 && 1 / num === Number.NEGATIVE_INFINITY) {
    return '-0.0';
  }

  if (Number.isInteger(num)) {
    return num.toString();
  }
  let str = num.toString();
  if (!str.includes('.') && !str.includes('e') && !str.includes('E')) {
    str += '.0';
  }
  return str;
}

function dumpBoolean(bool: boolean): string {
  return bool ? 'true' : 'false';
}

function dumpDate(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    throw new Error('Cannot dump invalid Date');
  }
  return date.toISOString();
}

function dumpValue(value: unknown, options: DumpOptions): string | undefined {
  if (typeof value === 'string') return dumpString(value);
  if (typeof value === 'number' || typeof value === 'bigint')
    return dumpNumber(value);
  if (typeof value === 'boolean') return dumpBoolean(value);
  if (value instanceof Date) return dumpDate(value);

  if (Array.isArray(value)) {
    return dumpInlineArray(value, options);
  }

  if (isPlainObject(value)) {
    return dumpInlineTable(value, options);
  }

  throw new Error(`Unexpected value type during generation: ${typeof value}`);
}

function dumpInlineArray(arr: unknown[], options: DumpOptions): string {
  const elements: string[] = [];
  for (const item of arr) {
    elements.push(dumpValue(item, options));
  }
  return `[${elements.join(', ')}]`;
}

function dumpInlineTable(obj: object, options: DumpOptions): string {
  const pairs: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const dumpedValue = dumpValue(value, options);
    const dumpedKey = dumpKey(key, options.forceQuotes ?? false);
    pairs.push(`${dumpedKey} = ${dumpedValue}`);
  }
  return `{ ${pairs.join(', ')} }`;
}

// -------------------------------------------------------------
// Main entry for the top-level tree
// -------------------------------------------------------------

function isTableArray(arr: unknown[]): arr is Record<string, unknown>[] {
  return arr.length > 0 && arr.every((v) => isPlainObject(v));
}

function shouldPrintTableHeader(val: Record<string, unknown>): boolean {
  const keys = Object.keys(val);
  if (keys.length === 0) return true;

  return Object.values(val).some(
    (v) =>
      typeof v === 'string' ||
      typeof v === 'number' ||
      typeof v === 'boolean' ||
      typeof v === 'bigint' ||
      v instanceof Date ||
      (Array.isArray(v) && !isTableArray(v))
  );
}

export function generateBase(
  obj: Record<string, unknown>,
  options: DumpOptions
): string {
  const rootResult = generateTableBody(obj, [], options);
  // Ensure trailing newline
  const nl = options.newline ?? '\n';
  return rootResult.replace(/(\\r?\\n){3,}/g, nl + nl).trim() + nl;
}

function generateTableBody(
  obj: Record<string, unknown>,
  pathPrefix: string[],
  options: DumpOptions
): string {
  const nl = options.newline ?? '\n';
  const forceQuotes = options.forceQuotes ?? false;

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
      const dumpedValue = dumpValue(value, options);
      simplePairs.push(`${dumpKey(key, forceQuotes)} = ${dumpedValue}`);
    }
  }

  let result = simplePairs.join(nl);
  if (
    simplePairs.length > 0 &&
    (nestedTables.length > 0 || nestedArraysOfTables.length > 0)
  ) {
    result += nl + nl; // padding after simple key-values
  }

  for (let i = 0; i < nestedTables.length; i++) {
    const { key, val } = nestedTables[i];
    const fullPath = [...pathPrefix, dumpKey(key, forceQuotes)];

    if (result.length > 0 && !result.endsWith(nl + nl)) {
      result += result.endsWith(nl) ? nl : nl + nl;
    }

    // Print table header only if it contains primitives or is empty
    if (fullPath.length > 0 && shouldPrintTableHeader(val)) {
      result += `[${fullPath.join('.')}]${nl}`;
    }
    result += generateTableBody(val, fullPath, options);
  }

  for (let i = 0; i < nestedArraysOfTables.length; i++) {
    const { key, arr } = nestedArraysOfTables[i];
    const fullPath = [...pathPrefix, dumpKey(key, forceQuotes)];

    for (let j = 0; j < arr.length; j++) {
      const item = arr[j];

      if (result.length > 0 && !result.endsWith(nl + nl)) {
        result += result.endsWith(nl) ? nl : nl + nl;
      }

      result += `[[${fullPath.join('.')}]]${nl}`;
      result += generateTableBody(item, fullPath, options);
    }
  }

  return result;
}
