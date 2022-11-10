import { load } from '../src';
import timezoneMock = require('timezone-mock');

it('should support offset date-times', () => {
  const input = `odt1 = 1979-05-27T07:32:00Z
odt2 = 1979-05-27T00:32:00-07:00
odt3 = 1979-05-27T00:32:00.999999-07:00`;

  const result = load(input);

  expect(result).toEqual({
    odt1: new Date(Date.UTC(1979, 4, 27, 7, 32, 0)),
    odt2: new Date(Date.UTC(1979, 4, 27, 7, 32, 0)),
    odt3: new Date(Date.UTC(1979, 4, 27, 7, 32, 0, 999)),
  });
});

it('should support replacing T with space in offset date-times', () => {
  const input = 'odt4 = 1979-05-27 07:32:00Z';
  const result = load(input);

  expect(result).toEqual({ odt4: new Date(Date.UTC(1979, 4, 27, 7, 32)) });
});

it('should support millisecond precision in offset date-times', () => {
  const input = 'odt5 = 1979-05-27T07:32:00.999999Z';
  const result = load(input);

  expect(result).toEqual({
    odt5: new Date(Date.UTC(1979, 4, 27, 7, 32, 0, 999)),
  });
});

it('should support local date-times', () => {
  timezoneMock.register('US/Pacific');
  const input = `ldt1 = 1979-05-27T07:32:00
ldt2 = 1979-05-27T00:32:00.999`;
  const result = load(input);

  expect(result).toEqual({
    ldt1: new Date(Date.UTC(1979, 4, 27, 14, 32, 0)),
    ldt2: new Date(Date.UTC(1979, 4, 27, 7, 32, 0, 999)),
  });
  timezoneMock.unregister();
});

it('should support local date', () => {
  const input = 'ld1 = 1979-05-27';
  const result = load(input);

  expect(result).toEqual({ ld1: new Date(Date.UTC(1979, 4, 27)) });
});
