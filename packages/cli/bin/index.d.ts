import * as RadixColors from '@radix-ui/colors'

export type ColorScheme = keyof typeof RadixColors
export type ColorRole =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
export declare const colorSteps: readonly [
  'base',
  'bgSubtle',
  'bg',
  'bgHover',
  'bgActive',
  'line',
  'border',
  'borderHover',
  'solid',
  'solidHover',
  'text',
  'textContrast'
]
export type ColorStep = typeof colorSteps[number]
export type Colors = Record<ColorRole, Record<ColorStep, string>>

export type ModularScaleOptions = {
  base?: string | number | string[] | number[]
  unit?: string
  ratio?: string | number
  points?: string | number
  pointStart?: string | number
}

export declare const ratios: {
  readonly minorSecond: number
  readonly majorSecond: 1.125
  readonly minorThird: 1.2
  readonly majorThird: 1.25
  readonly perfectFourth: number
  readonly augmentedFourth: 1.414
  readonly perfectFifth: 1.5
  readonly minorSixth: 1.6
  readonly goldenSection: 1.61803398875
  readonly majorSixth: number
  readonly minorSeventh: number
  readonly majorSeventh: 1.875
  readonly octave: 2
  readonly majorTenth: 2.5
  readonly majorEleventh: number
  readonly majorTwelfth: 3
  readonly doubleOctave: 4
}

export type CustomUnit<T = number | string> = {
  value: T
  unit: string
}
export type Scale<T = number | string> = {
  body?: T
  heading?: T
}
export type OutputThemeValue<T = string> = T | T[]
export type InputThemeValue<T = string | number> =
  | T
  | T[]
  | CustomUnit<T>
  | CustomUnit<T>[]
export type InputThemeScaleOptions = ModularScaleOptions & {
  field?: string
  fields?: string[]
}
export type InputTheme = {
  name: string
  scale?: InputThemeScaleOptions
  fonts?: Scale<string> & {
    monospace?: string
  }
  radii?: InputThemeValue<number>
  fontWeights?: Scale & {
    bold?: number
  }
  lineHeights?: Scale
  colors: Record<string, string>
}
export type OutputTheme = Omit<InputTheme, 'colors' | 'scale' | 'radii'> & {
  colors: Record<ColorRole, Record<ColorStep, string>>
  fontSizes: string[]
  space: string[]
  radii?: OutputThemeValue
}
