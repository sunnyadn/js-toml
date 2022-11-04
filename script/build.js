#!/usr/bin/env node

require('esbuild').build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  outdir: 'dist',
}).catch(() => process.exit(1))
