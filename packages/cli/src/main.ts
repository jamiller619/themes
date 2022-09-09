#!/usr/bin/env node
import yargs from 'yargs'
import build from './theme/build.js'

const { argv } = yargs(process.argv.slice(2))
  .usage('Usage: -i <input> -o <output>')
  .option('input', {
    alias: 'i',
    describe: 'Input file path',
    type: 'string',
    demandOption: true,
  })
  .option('output', {
    alias: 'o',
    describe: 'Where to output the generated assets',
    type: 'string',
    demandOption: true,
  })

const options = await argv

await build(options.input, options.output)
