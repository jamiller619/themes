import * as RadixColors from '@radix-ui/colors'
import { ColorScheme, colorSteps } from './Colors'

export default function expand(colorScheme: string) {
  const result: Record<string, string> = {}
  const steps = RadixColors[colorScheme as ColorScheme]

  if (steps == null) {
    throw new Error(
      `"${colorScheme}" isn't available from @radix-ui/colors. Check spelling.`
    )
  }

  const colors = Object.values(RadixColors[colorScheme as ColorScheme])

  for (let i = 0; i < colors.length; i += 1) {
    result[colorSteps[i]] = colors[i]
  }

  return result
}
