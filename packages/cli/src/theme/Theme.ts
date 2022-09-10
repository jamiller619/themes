import { ColorRole, ColorScheme, ColorStep } from '~/colors'
import { ModularScaleOptions } from '~/modular-scale'

export type CustomUnit<T = number | string> = {
  value: T
  unit: string
}

export type Scale<T = number | string> = {
  body?: T
  heading?: T
}

// export type ThemeValue =
//   | number
//   | number[]
//   | string
//   | string[]
//   | CustomUnit
//   | Scale
//   | Scale<CustomUnit>

// type AOrArrayOf<T> = T | T[]
export type OutputThemeValue<T = string> = T | T[]
export type InputThemeValue<T = string | number> =
  | T
  | T[]
  | CustomUnit<T>
  | CustomUnit<T>[]

export type InputTheme = {
  name: string
  scale?: ModularScaleOptions
  fonts?: Scale<string> & {
    monospace?: string
  }
  radii?: InputThemeValue<number>
  fontWeights?: Scale & {
    bold?: number
  }
  lineHeights?: Scale
  colors: Record<ColorRole, ColorScheme>
}

export type OutputTheme = Omit<InputTheme, 'colors' | 'scale' | 'radii'> & {
  colors: Record<ColorRole, Record<ColorStep, string>>
  fontSizes: string[]
  space: string[]
  radii?: OutputThemeValue
}
