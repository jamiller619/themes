import * as RadixColors from '@radix-ui/colors'

export type ColorScheme = keyof typeof RadixColors
export type ColorMode = 'light' | 'dark'

export type ColorRole =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'

export const colorSteps = [
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
  'textContrast',
] as const

export type ColorStep = typeof colorSteps[number]

type Colors = Record<ColorRole, Record<ColorStep, string>>

export default Colors
