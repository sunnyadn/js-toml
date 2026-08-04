import { globSync } from 'glob';
import * as fs from 'fs';
import { load, SyntaxParseError, TomlDate, TomlTime } from '../src/index.js';
import { dump } from '../src/dump/index.js';
import { isPlainObject } from '../src/common/utils.js';

const converters = {
  integer: (value) => {
    const result = parseInt(value, 10);
    if (Number.isSafeInteger(result)) {
      return result;
    }

    return BigInt(value);
  },
  datetime: (value) => new Date(value),
  float: (value) => {
    if (/^[-+]?inf$/.test(value)) {
      return value === '-inf'
        ? Number.NEGATIVE_INFINITY
        : Number.POSITIVE_INFINITY;
    }
    return parseFloat(value);
  },
  string: (value) => value,
  bool: (value) => value === 'true',
  // `date-local` is date-only, which `Date()` already reads as UTC. A bare
  // `datetime-local` would be read as host-local time, so pin it to UTC to
  // match how the loader represents an offset-less date-time.
  'date-local': (value) => new Date(value),
  'time-local': (value) => new TomlTime(value),
  'datetime-local': (value) => new Date(`${value}Z`),
};

const covertJsonFiles = (json) => {
  if (Array.isArray(json)) {
    return json.map(covertJsonFiles);
  }
  if (json.constructor === Object) {
    if (json && 'value' in json) {
      return converters[json.type](json.value);
    }

    const obj = {};
    Object.keys(json).forEach((key) => {
      obj[key] = covertJsonFiles(json[key]);
    });
    return obj;
  }
};

// Walks a loaded document and reports which TOML date/time type each Date came
// from, so a round trip can be checked for kind and not only for instant.
const dateKinds = (value) => {
  if (Array.isArray(value)) {
    return value.map(dateKinds);
  }
  if (value instanceof TomlDate) {
    return value.isDateOnly ? 'date' : value.isLocal ? 'local' : 'offset';
  }
  if (value instanceof Date) {
    return 'bare-date';
  }
  if (value instanceof TomlTime) {
    return 'time';
  }
  if (isPlainObject(value)) {
    const obj = {};
    Object.keys(value).forEach((key) => {
      obj[key] = dateKinds(value[key]);
    });
    return obj;
  }
  return null;
};

const replaceWindowsNewLine = (result) => {
  if (Array.isArray(result)) {
    return result.map(replaceWindowsNewLine);
  }
  if (isPlainObject(result)) {
    const obj = {};
    Object.keys(result).forEach((key) => {
      obj[key] = replaceWindowsNewLine(result[key]);
    });
    return obj;
  }
  if (typeof result === 'string') {
    return result.replace(/\r\n/g, '\n');
  }
  return result;
};

describe('Run TOML valid tests', () => {
  const validTestCases = globSync('testcase/valid/**/*.toml');
  for (const testCase of validTestCases) {
    const testName = testCase.replace(/^testcase\//, '').replace(/\.toml$/, '');
    it(`should parse ${testName} correctly`, () => {
      const toml = fs.readFileSync(testCase, 'utf8');
      const result = load(toml);
      const expectedFile = testCase.replace('.toml', '.json');
      const json = JSON.parse(fs.readFileSync(expectedFile, 'utf8'));
      // Normalize \r\n on both sides so the comparison is stable regardless of
      // the line endings the .toml files were checked out with.
      const expected = replaceWindowsNewLine(covertJsonFiles(json));
      expect(replaceWindowsNewLine(result)).toEqual(expected);

      // Round trip test: ensure dumped result parses back to the exact same JS object
      try {
        const dumped = dump(result);
        const doubleLoad = load(dumped);
        expect(replaceWindowsNewLine(doubleLoad)).toEqual(expected);
        // toEqual compares Dates by instant, so it cannot see a local date-time
        // re-emitted as `...Z`. Compare the TOML kind separately, which is the
        // blind spot that let that go unnoticed.
        expect(dateKinds(doubleLoad)).toEqual(dateKinds(result));
      } catch (e) {
        // Some properties might not be supported natively by our generator yet
        // but it's worth checking where it fails
        throw new Error(`Round-trip dump failed for ${testName}: ${e.message}`);
      }
    });
  }
});

describe('Run TOML invalid tests', () => {
  const invalidTestCases = globSync('testcase/invalid/**/*.toml');
  for (const testCase of invalidTestCases) {
    const testName = testCase.replace(/^testcase\//, '').replace(/\.toml$/, '');
    it(`should throw error for ${testName}`, () => {
      const bytes = fs.readFileSync(testCase);
      let toml: string;
      try {
        toml = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      } catch {
        // The input is not valid UTF-8. js-toml's load() takes an
        // already-decoded string, so byte-level validation is the host's job:
        // a strict decoder rejecting the input before load() ever sees it
        // satisfies the suite's "must be rejected" requirement. (A lossy
        // decode would turn the bad bytes into U+FFFD, valid TOML.)
        expect(testCase.replaceAll('\\', '/')).toContain('invalid/encoding/');
        return;
      }
      expect(() => load(toml)).toThrow(SyntaxParseError);
    });
  }
});
