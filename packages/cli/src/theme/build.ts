import fs from 'node:fs/promises'
import path from 'node:path'
import Ajv from 'ajv'
import chalk from 'chalk'
import debug from 'debug'
import mapObject, { mapObjectSkip } from 'map-obj'
import { toCustomPropertiesString } from 'object-to-css-variables'
import { ColorRole, expandToRadixColor } from '~/colors'
import { createScales } from '~/modular-scale'
import calcModifier from '~/utils/calcModifier'
import { InputTheme } from './Theme'
import schema from './schema.json' assert { type: 'json' }

const log = debug('theme.build')

const ajv = new Ajv()
const marks = {
  pass: '✔️ ',
  fail: '❌',
}

const readFile = async <T>(path: string) => {
  try {
    const file = await fs.readFile(path, {
      encoding: 'utf-8',
    })

    return JSON.parse(file) as T
  } catch {
    throw new Error(`Unable to find "${path}". Are you sure it exists?`)
  }
}

const parseValue = (
  value: InputTheme[keyof InputTheme],
  convertToPx = true
): string | Record<string, string | number> | undefined => {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number') {
    return `${value}${convertToPx ? 'px' : ''}`
  }

  if (value != null && 'value' in value && 'unit' in value) {
    return `${value.value}${value.unit}`
  }

  /**
   * It's super annoying that Array.isArray doesn't properly
   * narrow types in TS, forcing me to explicity type the value
   */
  if (Array.isArray(value)) {
    return (value as (string | number)[]).reduce((acc, curr, i) => {
      const modifier = calcModifier(i)
      acc[modifier] = convertToPx ? `${curr}px` : curr

      return acc
    }, {} as Record<string, string | number>)
  }
}

const convertThemeToCSSProperties = (
  theme: Record<string, string | number | Record<string, string>>
) => {
  return `:root {\n ${toCustomPropertiesString(theme).replaceAll(';', ';\n')}}`
}

type BuildOptions = {
  theme: string
  css: string
}

/**
 * From a "summary" theme.json file, generate another, fully
 * expanded theme.json implementing modular scale and Radix color schemes.
 */
export default async function build(input: string, opts: BuildOptions) {
  const themeFilePath = path.resolve(opts.theme)
  const cssPropertiesFilePath = path.resolve(opts.css)

  log(`Parsed build options: %O`, {
    themeFilePath,
    cssPropertiesFilePath,
  })

  const data = await readFile<InputTheme>(input)
  const valid = ajv.validate(schema, data)

  if (!valid) {
    console.log(marks.fail, chalk.red('Failed JSON schema validation'))

    return console.error(ajv.errors)
  }

  console.log(marks.pass, chalk.green(`Passed JSON schema validation`))

  const { colors, scale, name, ...theme } = data

  const result = mapObject(theme, (key, value) => {
    if (value == null) {
      return mapObjectSkip
    }

    const parsedValue = parseValue(value)

    if (parsedValue == null) {
      return mapObjectSkip
    }

    return [key, parsedValue]
  })

  const scales = createScales(data.scale)
  const expandedColors = Object.entries(colors).map(([key, value]) => {
    return [key, expandToRadixColor(value)] as [
      ColorRole,
      Record<string, string>
    ]
  })

  const outputTheme = {
    ...theme,
    ...result,
    fontSizes: scales,
    space: scales,
    colors: expandedColors.reduce((acc, curr) => {
      acc[curr[0]] = curr[1]

      return acc
    }, {} as Record<string, string | Record<string, string>>),
  } as Record<string, string | number | Record<string, string>>

  await fs.writeFile(themeFilePath, JSON.stringify(outputTheme, null, 2))

  console.log(
    marks.pass,
    chalk.green(`Theme saved: ${chalk.dim(themeFilePath)}`)
  )

  await fs.writeFile(
    cssPropertiesFilePath,
    convertThemeToCSSProperties(outputTheme)
  )

  console.log(
    marks.pass,
    chalk.green(`CSS Properties saved: ${chalk.dim(cssPropertiesFilePath)}`)
  )

  console.log(marks.pass, chalk.green(`Done!`))
}
