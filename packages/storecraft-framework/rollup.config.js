import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'es'
      },
      {
        file: 'dist/index.cjs',
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