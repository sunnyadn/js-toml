#!/usr/bin/env node

require('esbuild').build({
  bundle: true,
  entryPoints: ['src/index.ts'],
  external: ['chevrotain'],
  minify: true,
  outdir: 'dist',
}).catch(() => process.exit(1))
