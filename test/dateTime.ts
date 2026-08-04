import {
  load,
  dump,
  SyntaxParseError,
  TomlDate,
  TomlTime,
} from '../src/index.js';
import timezoneMock from 'timezone-mock';

// A failing assertion inside a registered zone would otherwise leak the mocked
// Date into every later test in the file. Unregistering when none is installed
// is a no-op, so this is safe for the tests that never register one.
afterEach(() => timezoneMock.unregister());

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

// A local date-time carries no offset, so the wall clock is pinned to UTC and
// the result must not depend on where the parse runs. The mock is here to prove
// independence: both zones have to produce the same instant.
it.each(['US/Pacific', 'Australia/Adelaide'] as const)(
  'should support local date-times, identically under %s',
  (zone) => {
    timezoneMock.register(zone);
    const input = `ldt1 = 1979-05-27T07:32:00
ldt2 = 1979-05-27T00:32:00.999`;

    expect(load(input)).toEqual({
      ldt1: new Date(Date.UTC(1979, 4, 27, 7, 32, 0)),
      ldt2: new Date(Date.UTC(1979, 4, 27, 0, 32, 0, 999)),
    });
  }
);

// 02:30 does not exist in US/Pacific on this date (spring forward), which is
// why the old host-local reading was ill-defined even on a single machine.
it('should parse a date-time that falls in a local DST gap', () => {
  timezoneMock.register('US/Pacific');

  expect(load('ldt = 2026-03-08T02:30:00')).toEqual({
    ldt: new Date(Date.UTC(2026, 2, 8, 2, 30, 0)),
  });
});

it('should support local date', () => {
  const input = 'ld1 = 1979-05-27';
  const result = load(input);

  expect(result).toEqual({ ld1: new Date(Date.UTC(1979, 4, 27)) });
});

it('should support local time', () => {
  const input = `lt1 = 07:32:00
lt2 = 00:32:00.999999`;
  const result = load(input);

  expect(result).toEqual({
    lt1: new TomlTime('07:32:00'),
    lt2: new TomlTime('00:32:00.999999'),
  });
});

// TOML 1.1: seconds are optional in times and date-times (toml-lang/toml
// CHANGELOG 1.1.0 #894; ABNF `partial-time = time-hour ":" time-minute
// [ ":" time-second [ time-secfrac ] ]`). Omitted seconds normalize to :00.

it('should support local times without seconds and normalize to :00', () => {
  const input = 'lt = 13:37';
  const result = load(input);

  expect(result).toEqual({ lt: new TomlTime('13:37:00') });
});

it('should support offset date-times without seconds', () => {
  const input = `odt1 = 1987-07-05T17:45Z
odt2 = 1979-05-27T00:32-07:00
odt3 = 1979-05-27 07:32Z`;
  const result = load(input);

  expect(result).toEqual({
    odt1: new Date(Date.UTC(1987, 6, 5, 17, 45, 0)),
    odt2: new Date(Date.UTC(1979, 4, 27, 7, 32, 0)),
    odt3: new Date(Date.UTC(1979, 4, 27, 7, 32, 0)),
  });
});

it('should support local date-times without seconds', () => {
  const input = 'ldt = 1979-05-27T07:32';
  const result = load(input);

  expect(result).toEqual({ ldt: new Date(Date.UTC(1979, 4, 27, 7, 32, 0)) });
});

it('should throw error for fractional seconds without whole seconds', () => {
  // TOML 1.1.0 ABNF: `time-secfrac` only follows `time-second`, so `13:37.123`
  // remains invalid even though seconds are optional.
  const input = 'lt = 13:37.123';
  expect(() => load(input)).toThrow(SyntaxParseError);
});

describe('type-preserving round trip', () => {
  // `dump(load(x))` used to re-emit every local date-time as `...Z`, asserting
  // a UTC instant the document never claimed. `TomlDate` carries the type so
  // the pair round-trips the meaning, not only the value.
  // Pinning the exact output subsumes instant-and-kind assertions: a stray `Z`
  // on the local date-time, or a time of day on the local date, changes it.
  const cases: [string, string, string][] = [
    [
      'offset date-time',
      'x = 1979-05-27T07:32:00Z',
      'x = 1979-05-27T07:32:00.000Z',
    ],
    [
      'local date-time',
      'x = 1979-05-27T07:32:00',
      'x = 1979-05-27T07:32:00.000',
    ],
    ['local date', 'x = 1979-05-27', 'x = 1979-05-27'],
    [
      'fractional local date-time',
      'x = 1979-05-27T00:32:00.999',
      'x = 1979-05-27T00:32:00.999',
    ],
  ];

  it.each(cases)(
    'should round-trip a %s unchanged in kind',
    (_name, toml, expected) => {
      const first = dump(load(toml));
      expect(first.trim()).toBe(expected);
      expect(dump(load(first))).toBe(first);
    }
  );

  it('should still write a plain Date as an offset date-time', () => {
    // A user-supplied Date is one instant and carries no TOML type, so the
    // only honest thing to write is an offset date-time.
    const out = dump({ x: new Date('1979-05-27T07:32:00Z') });
    expect(out.trim()).toBe('x = 1979-05-27T07:32:00.000Z');
  });

  // The slice offsets live on the type now, so they have to hold at any year
  // width. `dump()` still rejects the value; `toISOString()` must not mangle it.
  it('should not mangle a year outside TOML range', () => {
    const big = new TomlDate('+010000-01-01T00:00:00Z', 'local-date');
    expect(big.toISOString()).toBe('+010000-01-01');
    expect(() => dump({ x: big })).toThrow('out-of-range year');
  });

  it('should expose the type through instanceof rather than constructor', () => {
    const { x } = load('x = 1979-05-27T07:32:00') as { x: TomlDate };
    expect(x).toBeInstanceOf(Date);
    expect(x).toBeInstanceOf(TomlDate);
    expect(x.kind).toBe('local-date-time');
    expect(Object.keys(x)).toEqual([]);
  });
});

describe('local time', () => {
  it('should keep precision a Date-based encoding would round away', () => {
    const src = 't = 07:32:00.123456789';
    const { t } = load(src) as { t: TomlTime };
    expect(t.fraction).toBe('.123456789');
    expect(dump(load(src)).trim()).toBe(src);
  });

  it('should expose fields without a sentinel date to shift them', () => {
    const { t } = load('t = 07:32:00.5') as { t: TomlTime };
    expect([t.hour, t.minute, t.second]).toEqual([7, 32, 0]);
    // The anchor is what `instanceof Date` consumers compare on. No other
    // comparison pins it, since the rest are TomlTime against TomlTime; its
    // year is pinned separately by dumpDate's guard. `.5` is 500ms, not 5.
    expect(t.getTime()).toBe(27120500);
  });

  // Maximum accepted hour, minute and second in one value, with a fraction
  // longer than three digits. The `.5` case above cannot pin the seconds term
  // (it is zero there) nor the fraction slice (one digit slices the same).
  it('should build the anchor from every field', () => {
    const t = new TomlTime('23:59:59.123456789');
    expect(t.getTime()).toBe(((23 * 60 + 59) * 60 + 59) * 1000 + 123); // 86399123
  });

  // `dump()` writes a TomlTime bare, so anything that is not a time would come
  // back out as invalid TOML. The constructor is what makes that emit safe.
  it.each([
    ['not a time" #x'],
    ['7:5'],
    ['24:00:00'],
    ['12:60'],
    ['12:00:60'],
    ['12:00:00.'],
    [''],
  ])('should refuse to construct from %j', (raw) => {
    expect(() => new TomlTime(raw)).toThrow(SyntaxParseError);
  });

  it('should fill omitted seconds so the stored form is canonical', () => {
    expect(new TomlTime('13:37').toString()).toBe('13:37:00');
    expect(dump({ t: new TomlTime('13:37') }).trim()).toBe('t = 13:37:00');
  });

  // The whole point of extending `Date`: a generic walker dispatches on
  // `instanceof Date` and has no branch for anything else. This is the exact
  // chain teidesu/x-to-nix uses, which the String-based version fell through.
  it('should be reachable by a generic value walker', () => {
    const walk = (value: unknown) => {
      if (typeof value === 'string') return `string:${value}`;
      if (typeof value === 'number') return `number:${value}`;
      if (value instanceof Date) return `date:${value.toISOString()}`;
      if (typeof value === 'boolean') return `bool:${value}`;
      if (Array.isArray(value)) return 'array';
      if (value && typeof value === 'object') return 'OBJECT';
      throw new Error('unsupported');
    };

    const doc = load(`lt = 07:32:00.123456789
ld = 1979-05-27
ldt = 1979-05-27T07:32:00
odt = 1979-05-27T07:32:00Z`);

    expect(Object.values(doc).map(walk)).toEqual([
      'date:07:32:00.123456789',
      'date:1979-05-27',
      'date:1979-05-27T07:32:00.000',
      'date:1979-05-27T07:32:00.000Z',
    ]);
  });

  // toJSON delegates to toISOString, so overriding one fixes every consumer
  // that serializes rather than only this library's own dump().
  it('should not claim an offset the document never wrote', () => {
    const doc = load(
      'lt = 07:32:00\nld = 1979-05-27\nldt = 1979-05-27T07:32:00'
    );
    expect(JSON.stringify(doc)).toBe(
      '{"lt":"07:32:00","ld":"1979-05-27","ldt":"1979-05-27T07:32:00.000"}'
    );
  });
});
