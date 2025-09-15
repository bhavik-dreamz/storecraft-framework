const typescript = require('@rollup/plugin-typescript');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const fs = require('fs');

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

module.exports = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        exports: 'named'
      }
    ],
    external: [
      ...Object.keys(pkg.peerDependencies || {}),
      ...Object.keys(pkg.dependencies || {}),
      'react',
      'react-dom',
      'fs',
      'path',
      'chokidar'
    ],
    plugins: [
      resolve({
        preferBuiltins: true
      }),
      commonjs(),
      json(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        outDir: 'dist',
        exclude: ['**/*.test.ts', '**/*.test.tsx']
      })
    ]
  },
  {
    input: 'src/next-plugin.ts',
    output: {
      file: 'dist/next-plugin.js',
      format: 'cjs',
      exports: 'named'
    },
    external: [
      ...Object.keys(pkg.peerDependencies || {}),
      'fs',
      'path',
      'chokidar'
    ],
    plugins: [
      resolve({
        preferBuiltins: true
      }),
      commonjs(),
      json(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        outDir: 'dist'
      })
    ]
  }
];