import XRegExp from 'xregexp';
import { digit } from './patterns.js';
import { createToken } from 'chevrotain';
import { registerTokenInterpreter } from './tokenInterpreters.js';
import { SyntaxParseError } from '../exception.js';

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

const dateTime = XRegExp.build(
  '{{offsetDateTime}}|{{localDateTime}}|{{localDate}}|{{localTime}}',
  {
    offsetDateTime,
    localDateTime,
    localDate,
    localTime,
  }
);

export const DateTime = createToken({
  name: 'DateTime',
  pattern: dateTime,
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
    const dateObject = new Date(year, month - 1, day);
    return (
      dateObject.getFullYear() === year &&
      dateObject.getMonth() + 1 === month &&
      dateObject.getDate() === day
    );
  }

  return true;
};

const isValidTime = (value: string) => {
  const time = XRegExp.exec(value, timePattern);
  if (time) {
    const hour = Number(time[1]);
    const minute = Number(time[2]);
    const second = Number(time[3]);
    const dateObject = new Date(0, 0, 0, hour, minute, second);
    return (
      dateObject.getHours() === hour &&
      dateObject.getMinutes() === minute &&
      dateObject.getSeconds() === second
    );
  }

  return true;
};

const isValidDateTime = (value: string) =>
  isValidDate(value) && isValidTime(value);

// Matches a seconds-less time (TOML 1.1) right before its end or offset, so the
// omitted seconds can be normalized to `:00`. Encodes the same optional-seconds
// grammar as `partialTime` above — the two must stay in sync.
const secondsLessTime = XRegExp.build(
  '^((?:{{fullDate}}{{timeDelim}})?{{timeHour}}:{{timeMinute}})(?=$|[Zz+-])',
  { fullDate, timeDelim, timeHour, timeMinute }
);

registerTokenInterpreter(DateTime, (raw) => {
  // O(1) seconds-presence gate before the regex replace: the first `:` in any
  // DateTime token is always hour:minute, so seconds are present iff the char
  // three positions later is another `:`. Date-only tokens have no `:` at all.
  const firstColon = raw.indexOf(':');
  const value =
    firstColon !== -1 && raw.charCodeAt(firstColon + 3) !== 58 /* ':' */
      ? raw.replace(secondsLessTime, '$1:00')
      : raw;
  if (!isValidDateTime(value)) {
    throw new SyntaxParseError(`Invalid date time: ${raw}`);
  }

  const onlyTime = value.match(localTime)?.index === 0;
  if (onlyTime) {
    return value;
  }

  return new Date(value);
});
