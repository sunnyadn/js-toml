import XRegExp = require('xregexp');
import { digit } from './patterns';
import { createToken } from 'chevrotain';
import { registerTokenInterpreter } from './tokenInterpreters';

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

const dateTime = XRegExp.build(
  '{{offsetDateTime}}|{{localDateTime}}|{{localDate}}',
  {
    offsetDateTime,
    localDateTime,
    localDate,
  }
);
// OR localTime

export const DateTime = createToken({
  name: 'DateTime',
  pattern: dateTime,
});

registerTokenInterpreter(DateTime, (raw) => new Date(raw));
