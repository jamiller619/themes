#!/usr/bin/env node
import yargs from 'yargs'
import build from '~/theme/build'

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

try {
  const options = await argv

  await build(options.input, {
    css: options.css,
    theme: options.theme,
  })
} catch (err) {
  console.error(err)
}
