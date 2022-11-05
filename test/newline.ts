import {load} from "../src";

it('should treat LF(0x0A) as newline', () => {
    const input = '\n';
    const result = load(input);

    expect(result).toEqual({});
});

it('should treat CRLF(0x0D 0x0A) as newline', () => {
    const input = '\r\n';
    const result = load(input);

    expect(result).toEqual({});
});