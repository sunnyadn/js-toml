import { load } from '../src';

it('should support offset date-times', () => {
  const input = `odt1 = 1979-05-27T07:32:00Z
odt2 = 1979-05-27T00:32:00-07:00
odt3 = 1979-05-27T00:32:00.999999-07:00`;

  const result = load(input);

  expect(result).toEqual({
    odt1: new Date('1979-05-27T07:32:00Z'),
    odt2: new Date('1979-05-27T00:32:00-07:00'),
    odt3: new Date('1979-05-27T00:32:00.999999-07:00'),
  });
});

it('should support replacing T with space in offset date-times', () => {
  const input = 'odt4 = 1979-05-27 07:32:00Z';
  const result = load(input);

  expect(result).toEqual({ odt4: new Date('1979-05-27T07:32:00Z') });
});

it('should support millisecond precision in offset date-times', () => {
  const input = 'odt5 = 1979-05-27T07:32:00.999999Z';
  const result = load(input);

  expect(result).toEqual({ odt5: new Date('1979-05-27T07:32:00.999Z') });
});
