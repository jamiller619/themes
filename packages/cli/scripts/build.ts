#!/usr/bin/env node
import path from 'node:path'
import process from 'node:process'
import { TsconfigPathsPlugin } from '@esbuild-plugins/tsconfig-paths'
import chalk from 'chalk'
import esbuild from 'esbuild'
import dts from 'npm-dts'
import dirname from '../lib/dirname.js'
import pkgJSON from '../package.json' assert { type: 'json' }

const isProd = process.env.NODE_ENV === 'production'
const __dirname = dirname(import.meta.url)
const isWatchMode = process.argv.includes('-w')

console.log(
  `\n${chalk.bgBlueBright(isWatchMode ? 'Watching' : 'Building')} ${chalk.dim(
    '@themes/cli\n'
  )}`
)

const { Generator } = dts

const buildTypes = async () => {
  new Generator({
    entry: 'src/index.ts',
    output: 'dist/index.d.ts',
  }).generate()
}

const result = await esbuild.build({
  plugins: [
    TsconfigPathsPlugin({ tsconfig: path.join(__dirname, '../tsconfig.json') }),
  ],
  bundle: true,

  entryPoints: [path.join(__dirname, '../src/index.ts')],
  outfile: path.join(__dirname, '../dist', `index${isProd ? '.min' : ''}.js`),

  platform: 'node',
  target: 'node16.17',
  format: 'esm',

  sourcemap: true,
  minify: isProd,

  external: Object.keys(pkgJSON.dependencies),

  watch: {
    async onRebuild(err) {
      await buildTypes()

      if (err) {
        console.error(err)
      } else {
        console.log(
          chalk.green(
            `✔️  rebuild successful at ${chalk.dim(
              new Date().toLocaleTimeString()
            )}`
          )
        )
      }
    },
  },
})

await buildTypes()

if (result.errors.length > 0) {
  console.error(result.errors)
}

if (result.warnings.length > 0) {
  console.warn(result.warnings)
}

if (!isWatchMode) {
  console.log(chalk.greenBright('🗸 Build completed successfully!'))
}
