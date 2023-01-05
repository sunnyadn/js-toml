import { load } from 'js-toml';

const toml = `
# This is a TOML document. Boom.

title = "TOML Example"

[owner]
name = "Tom Preston-Werner"
dob = 1979-05-27T07:32:00-08:00 # First class dates? Why not?
`;

const result = load(toml);

console.log(result);
