import fs from 'node:fs/promises'
import Ajv from 'ajv'
import Theme from './Theme.js'
import schema from './schema.json'

const readFile = async (path: string) => {
  try {
    const file = await fs.readFile(path, {
      encoding: 'utf-8',
    })

    return JSON.parse(file) as Theme
  } catch (err) {
    console.error(`Unable to find "${path}". Are you sure it exists?`)
  }
}

/**
 * From a "summary" theme.json file, generate another, fully
 * expanded theme.json implementing modular scale and Radix color schemes.
 */
export default async function build(input: string, output: string) {
  const data = await readFile(input)
}
