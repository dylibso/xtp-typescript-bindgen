const esbuild = require('esbuild');

esbuild
  .build({
    entryPoints: ['src/index.ts'],
    outdir: 'dist',
    bundle: true,
    sourcemap: true,
    minify: false, // might want to use true for production build
    format: 'cjs', // needs to be CJS for now
    target: ['es2020'], // don't go over es2020 because quickjs doesn't support it

    // EJS tries to load node modules that aren't there at runtime (fs and path)
    // this is okay we don't need them, so we'll replace them with an empty js module
    plugins: [
      {
        name: 'stub-ejs-deps',
        setup(build) {
          build.onResolve({ filter: /(^fs|^path)$/ }, args => {
            return { path: require.resolve('./dummy.js') }
          });
        },
      },
    ],
  })
