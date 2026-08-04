import XRegExp from 'xregexp';
import { digit } from './patterns.js';
import { createToken } from 'chevrotain';
import {
  createCategoryToken,
  registerTokenInterpreter,
} from './tokenInterpreters.js';
import { SyntaxParseError } from '../exception.js';
import { TomlDate } from '../../common/TomlDate.js';
import { TomlTime } from '../../common/TomlTime.js';

const dateFullYear = XRegExp.build('{{digit}}{4}', { digit });
const dateMonth = XRegExp.build('{{digit}}{2}', { digit });
const dateMDay = XRegExp.build('{{digit}}{2}', { digit });
const timeDelim = /[Tt ]/;
const timeHour = XRegExp.build('{{digit}}{2}', { digit });
const timeMinute = XRegExp.build('{{digit}}{2}', { digit });
const timeSecond = XRegExp.build('{{digit}}{2}', { digit });
const timeSecFrac = XRegExp.build('\\.{{digit}}+', { digit });
const timeNumOffset = XRegExp.build('[+-]{{timeHour}}:{{timeMinute}}', {
  timeHour,
  timeMinute,
});
const timeOffset = XRegExp.build('[Zz]|{{timeNumOffset}}', { timeNumOffset });

// TOML 1.1: seconds are optional; a fractional part still requires them
// (partial-time = time-hour ":" time-minute [ ":" time-second [ time-secfrac ] ])
const partialTime = XRegExp.build(
  '{{timeHour}}:{{timeMinute}}(?::{{timeSecond}}{{timeSecFrac}}?)?',
  {
    timeHour,
    timeMinute,
    timeSecond,
    timeSecFrac,
  }
);
const fullDate = XRegExp.build('{{dateFullYear}}-{{dateMonth}}-{{dateMDay}}', {
  dateFullYear,
  dateMonth,
  dateMDay,
});
const fullTime = XRegExp.build('{{partialTime}}{{timeOffset}}', {
  partialTime,
  timeOffset,
});

const offsetDateTime = XRegExp.build('{{fullDate}}{{timeDelim}}{{fullTime}}', {
  fullDate,
  timeDelim,
  fullTime,
});

const localDateTime = XRegExp.build(
  '{{fullDate}}{{timeDelim}}{{partialTime}}',
  { fullDate, timeDelim, partialTime }
);

// One category with four concrete tokens rather than one token whose pattern
// alternates: the lexer then reports which of TOML's date/time types matched,
// instead of the interpreter re-deriving it from the string.
export const DateTime = createCategoryToken('DateTime');

export const OffsetDateTime = createToken({
  name: 'OffsetDateTime',
  pattern: offsetDateTime,
  categories: [DateTime],
});

export const LocalDateTime = createToken({
  name: 'LocalDateTime',
  pattern: localDateTime,
  categories: [DateTime],
});

export const LocalDate = createToken({
  name: 'LocalDate',
  pattern: fullDate,
  categories: [DateTime],
});

export const LocalTime = createToken({
  name: 'LocalTime',
  pattern: partialTime,
  categories: [DateTime],
});

const datePattern = XRegExp.build(
  '({{dateFullYear}})-({{dateMonth}})-({{dateMDay}})',
  { dateFullYear, dateMonth, dateMDay }
);

const timePattern = XRegExp.build(
  '({{timeHour}}):({{timeMinute}}):({{timeSecond}})',
  { timeHour, timeMinute, timeSecond }
);

// Each check runs only where its token's grammar guarantees a match, so none
// of them needs a "no match means valid" escape hatch.
const isValidDate = (value: string) => {
  // Indexed, not destructured: destructuring a match array goes through the
  // iterator protocol, which measures slower on this path.
  const date = XRegExp.exec(value, datePattern);
  const year = Number(date[1]);
  const month = Number(date[2]);
  const day = Number(date[3]);
  // setUTCFullYear (not the Date constructor) so years 00-99 are not
  // remapped to 1900-1999, which would use the wrong year's leap rules.
  const dateObject = new Date(0);
  dateObject.setUTCFullYear(year, month - 1, day);
  return (
    dateObject.getUTCFullYear() === year &&
    dateObject.getUTCMonth() + 1 === month &&
    dateObject.getUTCDate() === day
  );
};

const isValidTime = (value: string) => {
  // A Date round-trip would say exactly this, only via a clock the check has
  // no use for. Leap seconds stay out.
  const time = XRegExp.exec(value, timePattern);
  return (
    Number(time[1]) <= 23 && Number(time[2]) <= 59 && Number(time[3]) <= 59
  );
};

// RFC 3339: offset hour is 00-23, minute is 00-59. `Z` carries no numeric
// offset, which is the one case this has nothing to check.
const offsetPattern = /[+-](\d{2}):(\d{2})$/;

const isValidOffset = (value: string) => {
  const offset = offsetPattern.exec(value);
  return !offset || (Number(offset[1]) <= 23 && Number(offset[2]) <= 59);
};

// Date-times only: `fullDate` is 10 characters and the delimiter one, so the
// seconds colon can only ever sit at index 16. A bare local time is not handled
// here, `TomlTime` normalizes its own. Seconds are optional in TOML 1.1.
const SECONDS_COLON = 16;

const fillSeconds = (raw: string) =>
  raw.charCodeAt(SECONDS_COLON) === 58 /* ':' */
    ? raw
    : `${raw.slice(0, SECONDS_COLON)}:00${raw.slice(SECONDS_COLON)}`;

const invalid = (raw: string) =>
  new SyntaxParseError(`Invalid date time: ${raw}`);

// `Date`'s legacy parser, which a space delimiter selects, remaps years 00-99:
// `new Date('0001-01-01 00:00:00Z')` is 2001. Canonicalizing to ISO 8601 form
// keeps it on the spec path.
const toIso = (value: string) => value.replace(/[t ]/, 'T').replace(/z$/, 'Z');

registerTokenInterpreter(OffsetDateTime, (raw) => {
  const value = fillSeconds(raw);
  if (!isValidDate(value) || !isValidTime(value) || !isValidOffset(value)) {
    throw invalid(raw);
  }
  return new TomlDate(toIso(value));
});

registerTokenInterpreter(LocalDateTime, (raw) => {
  const value = fillSeconds(raw);
  if (!isValidDate(value) || !isValidTime(value)) throw invalid(raw);
  // The document states no offset, so reading the wall clock as anything but
  // UTC would make the instant depend on where the parse happened to run.
  return new TomlDate(`${toIso(value)}Z`, 'local-date-time');
});

registerTokenInterpreter(LocalDate, (raw) => {
  if (!isValidDate(raw)) throw invalid(raw);
  return new TomlDate(raw, 'local-date');
});

// The lexer admits `25:99`, so the range check is `TomlTime`'s, which it owns
// for hand-built values too.
registerTokenInterpreter(LocalTime, (raw) => new TomlTime(raw));
