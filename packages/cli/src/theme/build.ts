import fs from 'node:fs/promises'
import path from 'node:path'
import Ajv from 'ajv'
import chalk from 'chalk'
import debug from 'debug'
import mapObject, { mapObjectSkip } from 'map-obj'
import { toCustomPropertiesString } from 'object-to-css-variables'
import { ColorRole, expandToRadixColor } from '~/colors'
import { createScales } from '~/modular-scale'
import { InputTheme } from './Theme'
import schema from './schema.json' assert { type: 'json' }

const log = debug('theme.build')

const ajv = new Ajv()

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
): string | string[] | undefined => {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number') {
    return `${value}${convertToPx ? 'px' : ''}`
  }

  if (value != null && 'value' in value && 'unit' in value) {
    return `${value.value}${value.unit}`
  }

  if (Array.isArray(value)) {
    const valueArr = value.map((val) => parseValue(val, convertToPx)).flat()

    return valueArr.filter((v) => v != null) as string[]
  }
}

const convertThemeToCSSProperties = (
  theme: Record<string, string | number | Record<string, string>>
) => {
  return `:root {\n ${toCustomPropertiesString(theme).replaceAll(';', ';\n')}}`
}

const saveFile = async (
  dest: string,
  data: Parameters<typeof fs.writeFile>[1]
) => {
  await fs.writeFile(dest, data)

  console.log(`${chalk.dim(`File saved `)} ${dest}`)
}

type BuildOptions = {
  theme: string
  css: string
}

const parseBuildOptions = (buildOptions: BuildOptions) => {
  return {
    theme: resolvedThemeFile,
    cssProperties: resolvedCSSFile,
  }
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
    return console.error(ajv.errors)
  }

  log(`Passed JSON schema validation`)

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

  await saveFile(themeFilePath, JSON.stringify(outputTheme, null, 2))
  await saveFile(
    cssPropertiesFilePath,
    convertThemeToCSSProperties(outputTheme)
  )

  console.log(chalk.green(`✔️  Done!`))
}
