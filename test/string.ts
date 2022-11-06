import {load} from "../src";

it('should support escaped characters', () => {
  const input = `str = "I'm a string. \\"You can quote me\\". Name\\tJos\\u00E9\\nLocation\\tSF."`;
  const result = load(input);

  expect(result).toEqual({str: "I'm a string. \"You can quote me\". Name\tJosé\nLocation\tSF."});
});

it('should support multi-line basic strings', () => {
  const input = `str1 = """
Roses are red
Violets are blue"""`;
  const result = load(input);

  expect(result).toEqual({str1: "Roses are red\nViolets are blue"});
});
