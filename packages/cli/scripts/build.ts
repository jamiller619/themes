#!/usr/bin/env node
import path from 'node:path'
import process from 'node:process'
import { TsconfigPathsPlugin } from '@esbuild-plugins/tsconfig-paths'
import chalk from 'chalk'
import esbuild from 'esbuild'
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

const result = await esbuild.build({
  plugins: [
    TsconfigPathsPlugin({ tsconfig: path.join(__dirname, '../tsconfig.json') }),
  ],
  entryPoints: [path.join(__dirname, '../src/main.ts')],
  bundle: true,
  outfile: path.join(__dirname, '../dist', `main${isProd ? '.min' : ''}.js`),
  platform: 'node',
  target: 'node16.17',
  format: 'esm',
  sourcemap: true,
  minify: isProd,
  external: Object.keys(pkgJSON.dependencies),
  watch: {
    onRebuild(err) {
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

if (result.errors.length > 0) {
  console.error(result.errors)
}

if (result.warnings.length > 0) {
  console.warn(result.warnings)
}

if (!isWatchMode) {
  console.log(chalk.greenBright('🗸 Build completed successfully!'))
}
