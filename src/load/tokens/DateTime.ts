import XRegExp = require('xregexp');
import { digit } from './patterns';
import { createToken } from 'chevrotain';
import { registerTokenInterpreter } from './tokenInterpreters';
import { SyntaxParseError } from '../exception';

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

const partialTime = XRegExp.build(
  '{{timeHour}}:{{timeMinute}}:{{timeSecond}}{{timeSecFrac}}?',
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

const isValidDate = (value: string) => {
  const datePattern = XRegExp.build(
    '({{dateFullYear}})-({{dateMonth}})-({{dateMDay}})',
    {
      dateFullYear,
      dateMonth,
      dateMDay,
    }
  );
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
  const timePattern = XRegExp.build(
    '({{timeHour}}):({{timeMinute}}):({{timeSecond}})',
    {
      timeHour,
      timeMinute,
      timeSecond,
    }
  );
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

registerTokenInterpreter(DateTime, (raw) => {
  if (!isValidDateTime(raw)) {
    throw new SyntaxParseError(`Invalid date time: ${raw}`);
  }

  const onlyTime = raw.match(localTime)?.index === 0;
  if (onlyTime) {
    return raw;
  }

  return new Date(raw);
});
