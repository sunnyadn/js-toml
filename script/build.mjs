#!/usr/bin/env node

import {build} from 'esbuild';

build({
  bundle: true,
  entryPoints: ['src/index.ts'],
  external: ['chevrotain', 'xregexp'],
  outdir: 'dist',
}).catch(() => process.exit(1));
