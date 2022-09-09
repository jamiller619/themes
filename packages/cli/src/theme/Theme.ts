import { ModularScaleOptions } from '~/modular-scale'

export type CustomUnit<T = number | string> = {
  value: T
  unit: string
}

export type Scale<T = number | string> = {
  body?: T
  heading?: T
}

export type ThemeValue =
  | number
  | number[]
  | string
  | string[]
  | CustomUnit
  | Scale
  | Scale<CustomUnit>

export type Theme = {
  name: string
  fonts?: Scale<string> & {
    monospace?: string
  }
  radii?: ThemeValue[]
  fontWeights?: Scale & {
    bold?: number
  }

  lineHeights?: Scale

  colors: Record<string, string>

  scale?: ModularScaleOptions
  fontSize?: ThemeValue
  space?: ThemeValue
}

export default Theme
