import path from 'path'
import process from 'process'
import builtins from 'builtin-modules'
import esbuild from 'esbuild'
import { copy } from 'esbuild-plugin-copy'

/** @param {string[]} paths */
function resolve(...paths) {
  // is assumed that cwd should return the root dir
  return path.resolve(process.cwd(), ...paths)
}

/** @param {string[]} paths */
function resolveOnVault(...paths) {
  return resolve('test-vault/.obsidian/plugins/components/', ...paths)
}

/** @type {esbuild.BuildOptions} */
const BASE_CONFIG = {
  entryPoints: [resolve('src/main.ts')],
  sourceRoot: '',
  bundle: true,
  format: 'cjs',
  target: 'es2016',
  treeShaking: true,
  external: [
    'obsidian',
    'electron',
    '@codemirror/autocomplete',
    '@codemirror/closebrackets',
    '@codemirror/collab',
    '@codemirror/commands',
    '@codemirror/comment',
    '@codemirror/fold',
    '@codemirror/gutter',
    '@codemirror/highlight',
    '@codemirror/history',
    '@codemirror/language',
    '@codemirror/lint',
    '@codemirror/matchbrackets',
    '@codemirror/panel',
    '@codemirror/rangeset',
    '@codemirror/rectangular-selection',
    '@codemirror/search',
    '@codemirror/state',
    '@codemirror/stream-parser',
    '@codemirror/text',
    '@codemirror/tooltip',
    '@codemirror/view',
    ...builtins,
  ],
}

/** @type {esbuild.BuildOptions} */
const DEV_CONFIG = {
  ...BASE_CONFIG,
  watch: true,
  outdir: resolveOnVault(),
  logLevel: 'info',
  sourcemap: 'inline',
  plugins: [
    copy({
      once: true,
      resolveFrom: resolve(),
      assets: [
        { from: 'manifest.json', to: resolveOnVault('manifest.json') },
        { from: 'styles.css', to: resolveOnVault('styles.css') },
      ],
    }),
  ],
}

/** @type {esbuild.BuildOptions} */
const PROD_CONFIG = {
  ...BASE_CONFIG,
  watch: false,
  outdir: 'dist',
  logLevel: 'error',
  sourcemap: false,
  // plugins: [],
  banner: {
    js: [
      '/*',
      'THIS IS A GENERATED/BUNDLED FILE BY ESBUILD',
      'if you want to view the source, please visit the github repository of this plugin',
      '*/\n',
    ].join('\n'),
  },
}

// compilation process
if ((process.env.npm_lifecycle_script || '').includes('production')) {
  // Production plugin build
  await esbuild.build(PROD_CONFIG)
} else {
  // Development build
  await esbuild.build(DEV_CONFIG)
}
