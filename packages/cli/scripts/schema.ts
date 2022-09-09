/**
 * Generate JSON schema based on TypeScript types
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import chalk from 'chalk'
import { JSONSchema7 } from 'json-schema'
import tsj from 'ts-json-schema-generator'
import dirname from '../lib/dirname.js'

const root = path.resolve(dirname(import.meta.url), '../')

const config = {
  path: path.join(root, 'src/theme/Theme.ts'),
  tsconfig: path.join(root, 'tsconfig.json'),
  type: '*',
}

const schemaDestPath = path.join(root, 'src/theme/schema.json')

const write = async (schema: JSONSchema7) => {
  const schemaString = JSON.stringify(schema, null, 2)

  await fs.writeFile(schemaDestPath, schemaString)

  console.log(
    chalk.greenBright(
      `Schema generated successfully @ file:"${schemaDestPath}"`
    )
  )
}

const exists = async (path: string) => {
  try {
    await fs.access(path)

    return true
  } catch {
    return false
  }
}

console.log(chalk.dim(`\nChecking schema...`))

const doesExist = await exists(schemaDestPath)

if (!doesExist || process.argv.includes('-f')) {
  console.log(chalk.dim(`No schema found, generating new schema...\n`))

  const output = tsj.createGenerator(config).createSchema(config.type)

  await write(output)
  console.log(chalk.greenBright('Done!'))
} else {
  console.log(chalk.dim(`Nothing to see here!`))
}
