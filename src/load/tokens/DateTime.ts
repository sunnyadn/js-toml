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

const localDate = fullDate;

const localTime = partialTime;

// One category with four concrete tokens rather than one token whose pattern
// alternates: the lexer then reports which of TOML's date/time types matched,
// instead of the interpreter re-deriving it from the string. `parser.ts` and
// `interpreter.ts` consume the category and are unaffected.
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
  pattern: localDate,
  categories: [DateTime],
});

export const LocalTime = createToken({
  name: 'LocalTime',
  pattern: localTime,
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

const isValidDate = (value: string) => {
  const date = XRegExp.exec(value, datePattern);
  if (date) {
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
  }

  return true;
};

const isValidTime = (value: string) => {
  const time = XRegExp.exec(value, timePattern);
  if (time) {
    // Same shape as isValidOffset below. A Date round-trip would say exactly
    // this, only via a clock the check has no use for. Leap seconds stay out.
    return (
      Number(time[1]) <= 23 && Number(time[2]) <= 59 && Number(time[3]) <= 59
    );
  }

  return true;
};

// Numeric offset at the end of an offset date-time (the date part never
// matches: it has no `:`). RFC 3339: offset hour is 00-23, minute is 00-59.
const offsetPattern = /[+-](\d{2}):(\d{2})$/;

const isValidOffset = (value: string) => {
  const offset = offsetPattern.exec(value);
  if (offset) {
    return Number(offset[1]) <= 23 && Number(offset[2]) <= 59;
  }

  return true;
};

const isValidDateTime = (value: string) =>
  isValidDate(value) && isValidTime(value) && isValidOffset(value);

// Matches a seconds-less time (TOML 1.1) right before its end or offset, so the
// omitted seconds can be normalized to `:00`. Encodes the same optional-seconds
// grammar as `partialTime` above — the two must stay in sync.
const secondsLessTime = XRegExp.build(
  '^((?:{{fullDate}}{{timeDelim}})?{{timeHour}}:{{timeMinute}})(?=$|[Zz+-])',
  { fullDate, timeDelim, timeHour, timeMinute }
);

// Normalize an omitted-seconds time (TOML 1.1) and reject an out-of-range
// field, then canonicalize the delimiter and offset marker so `Date()` takes
// the ISO 8601 path. Its legacy parser, which a space delimiter selects, remaps
// years 00-99: `new Date('0001-01-01 00:00:00Z')` is 2001.
const normalize = (raw: string) => {
  // O(1) seconds-presence gate before the regex replace: the first `:` in any
  // date/time token is hour:minute, so seconds are present iff the character
  // three positions later is another `:`. Date-only tokens have no `:` at all.
  const firstColon = raw.indexOf(':');
  const value =
    firstColon !== -1 && raw.charCodeAt(firstColon + 3) !== 58 /* ':' */
      ? raw.replace(secondsLessTime, '$1:00')
      : raw;

  if (!isValidDateTime(value)) {
    throw new SyntaxParseError(`Invalid date time: ${raw}`);
  }

  return value.replace(/[t ]/, 'T').replace(/z$/, 'Z');
};

registerTokenInterpreter(OffsetDateTime, (raw) => new TomlDate(normalize(raw)));

registerTokenInterpreter(
  LocalDateTime,
  // The document states no offset, so reading the wall clock as anything but
  // UTC would make the instant depend on where the parse happened to run.
  (raw) => new TomlDate(`${normalize(raw)}Z`, { isLocal: true })
);

registerTokenInterpreter(
  LocalDate,
  (raw) => new TomlDate(normalize(raw), { isLocal: true, isDateOnly: true })
);

// A time of day is not an instant, so it gets a `String` rather than a `Date`.
registerTokenInterpreter(LocalTime, (raw) => new TomlTime(normalize(raw)));
