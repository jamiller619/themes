#!/usr/bin/env node
import yargs from 'yargs'
import build from '~/theme/build'
import watch from '~/theme/watch'

const { argv } = yargs(process.argv.slice(2))
  .usage('Usage: -i <input file> -o <output dir>')
  .option('input', {
    alias: 'i',
    describe: 'Input file path',
    type: 'string',
    demandOption: true,
  })
  .option('theme', {
    alias: 't',
    describe: 'The path used to save the generated theme file',
    type: 'string',
    demandOption: true,
    default: './theme.json',
  })
  .option('css', {
    alias: 'c',
    describe: 'The path used to save the generated css properties file',
    type: 'string',
    demandOption: true,
    default: './_variables.css',
  })
  .option('watch', {
    alias: 'w',
    describe: 'Run build in watch mode',
    type: 'boolean',
    default: false,
  })

try {
  const options = await argv
  const cmd = options.watch ? watch : build

  await cmd(options.input, {
    css: options.css,
    theme: options.theme,
  })
} catch (err) {
  console.error(err)
}
