import Benchmark from 'benchmark';
import glob from 'glob';
import fs from 'fs';
import jstoml from '../src';

const suite = new Benchmark.Suite();

const cases = glob.sync('benchmark/case/*.toml');
const contents = {};

for (const testCase of cases) {
  const testName = testCase.split('/').pop().replace('.toml', '');
  contents[testName] = fs.readFileSync(testCase, 'utf8');
  suite.add(testName, () => {
    jstoml.load(contents[testName]);
  });
}

suite.on('cycle', (event: { target: never }) => {
  console.log(String(event.target));
});

suite.on('error', (event: { target: { error: never } }) => {
  console.error(event.target.error);
});

suite.run();
