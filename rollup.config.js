import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import { terser } from 'rollup-plugin-terser'
import banner from 'rollup-plugin-banner'
import nodePolyfills from 'rollup-plugin-node-polyfills'

export default [
  /**
   * Entry: Txpost Web
   */
  {
    input: 'src/index.js',
    output: [
      // 1: Full build
      {
        file: 'dist/txpost.js',
        format: 'iife',
        name: 'Txpost',
        globals: {
          bsv: 'bsvjs'
        }
      },
      // 2: Minimised
      {
        file: 'dist/txpost.min.js',
        format: 'iife',
        name: 'Txpost',
        globals: {
          bsv: 'bsvjs'
        },
        plugins: [
          terser()
        ]
      }
    ],
    external: ['bsv'],
    plugins: [
      nodePolyfills(),
      resolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**',
        babelHelpers: 'bundled'
      }),
      json(),
      banner('Txpost - v<%= pkg.version %>\n<%= pkg.description %>\n<%= pkg.repository %>\nCopyright © <%= new Date().getFullYear() %> Chronos Labs Ltd. <%= pkg.license %> License')
    ]
  },

  /**
   * Entry: TxForge CJS
   */
  {
    input: 'src/index.js',
    output: {
      file: 'dist/txpost.cjs.js',
      format: 'cjs'
    },
    external: ['bsv', 'buffer'],
    plugins: [
      resolve(),
      commonjs(),
      json()
    ]
  }
]