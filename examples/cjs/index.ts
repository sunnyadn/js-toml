import { load, dump } from 'js-toml';

const toml = `
# This is a TOML document. Boom.

title = "TOML Example"

[owner]
name = "Tom Preston-Werner"
dob = 1979-05-27T07:32:00-08:00 # First class dates? Why not?
`;

// Parse TOML text into a JavaScript object
const result = load(toml);
console.log(result);

// Serialize a JavaScript object back into TOML text
console.log(dump(result));
