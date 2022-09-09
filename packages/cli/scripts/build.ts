#!/usr/bin/env node

import chalk from 'chalk'
import esbuild from 'esbuild'
import path from 'node:path'
import process from 'node:process'
import pkgJSON from '../package.json' assert { type: 'json' }
import { ChildProcess, spawn } from 'node:child_process'
import dirname from '../lib/dirname.js'

const isProd = process.env.NODE_ENV === 'production'
const __dirname = dirname(import.meta.url)

console.log(chalk.dim(`\nBuilding ${chalk.blue('@themes/cli')}\n`))

const isWatchMode = process.argv.includes('-w')
let proc: ChildProcess | null = null

const build = () => {
  proc && proc.kill()
  proc = spawn('node', ['-r', 'dotenv/config', '.'], {
    stdio: 'inherit',
  })
}

const result = await esbuild.build({
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
        console.error('watch build failed:', err)
      } else {
        build()
      }
    }
  },
})

if (result.errors.length > 0) {
  console.error(result.errors)
}

if (result.warnings.length > 0) {
  console.warn(result.warnings)
}

if (!isWatchMode) {
  console.log(chalk.greenBright('Build completed successfully!'))
} else {
  build()
}
