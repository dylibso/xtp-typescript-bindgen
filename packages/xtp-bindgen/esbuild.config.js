const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  sourcemap: true,
  outfile: 'dist/index.js',
  platform: 'node',
  target: 'es6'
}).catch(() => process.exit(1));
