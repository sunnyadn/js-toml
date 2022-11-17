import glob from 'glob';
import * as fs from 'fs';
import jstoml, { SyntaxParseError } from '../src';

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
  'date-local': (value) => new Date(value),
  'time-local': (value) => value,
  'datetime-local': (value) => new Date(value),
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

const replaceWindowsNewLine = (result) => {
  if (Array.isArray(result)) {
    return result.map(replaceWindowsNewLine);
  }
  if (result.constructor === Object) {
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
  const validTestCases = glob.sync('testcase/valid/**/*.toml');
  for (const testCase of validTestCases) {
    const testName = testCase.replace(/^testcase\//, '').replace(/\.toml$/, '');
    it(`should parse ${testName} correctly`, () => {
      const toml = fs.readFileSync(testCase, 'utf8');
      const result = jstoml.load(toml);
      const expectedFile = testCase.replace('.toml', '.json');
      const json = JSON.parse(fs.readFileSync(expectedFile, 'utf8'));
      const expected = covertJsonFiles(json);
      expect(replaceWindowsNewLine(result)).toEqual(expected);
    });
  }
});

describe('Run TOML invalid tests', () => {
  const invalidTestCases = glob.sync('testcase/invalid/**/*.toml');
  for (const testCase of invalidTestCases) {
    const testName = testCase.replace(/^testcase\//, '').replace(/\.toml$/, '');
    it(`should throw error for ${testName}`, () => {
      const toml = fs.readFileSync(testCase, 'utf8');
      expect(() => jstoml.load(toml)).toThrow(SyntaxParseError);
    });
  }
});
