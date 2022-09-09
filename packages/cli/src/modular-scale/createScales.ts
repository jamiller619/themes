import ratios from './ratios.js'

export type ModularScaleOptions = {
  base?: number | number[]
  ratio?: string | number
  points?: number
  pointStart?: number
  field?: string
  fields?: string[]
}

const defaultOptions = {
  base: 16,
  ratio: ratios.perfectFifth,
  points: 11,
  pointStart: -2,
}

const parseOpts = (opts?: ModularScaleOptions) => {
  const base = opts?.base ?? defaultOptions.base
  const raw = opts?.ratio ?? defaultOptions.ratio
  const ratio =
    typeof raw === 'string' ? ratios[raw as keyof typeof ratios] : raw
  const points = opts?.points ?? defaultOptions.points
  const pointStart = opts?.pointStart ?? defaultOptions.pointStart
  const pointRange = [pointStart, pointStart + points]

  return {
    base,
    ratio,
    pointRange,
  }
}

const calcScale = (point: number, opts: ReturnType<typeof parseOpts>) => {
  const { base, ratio } = opts
  const isBaseArr = Array.isArray(base)

  // Fast calc if not multi stranded
  if (!isBaseArr || base.length === 1) {
    const bv = isBaseArr ? base[0] : base

    return Math.pow(ratio, point) * bv
  }

  // Normalize bases
  // Find the upper bounds for base values
  const baseHigh = Math.pow(ratio, 1) * base[0]
  for (let i = 1; i < base.length; i++) {
    // shift up if value too low
    while (base[i] / 1 < base[0] / 1) {
      base[i] = Math.pow(ratio, 1) * base[i]
    }
    // Shift down if too high
    while (base[i] / 1 >= baseHigh / 1) {
      base[i] = Math.pow(ratio, -1) * base[i]
    }
  }

  // Sort bases
  base.sort()

  // Figure out what base to use with modulo
  const rBase = Math.round(
    (point / base.length - Math.floor(point / base.length)) * base.length
  )

  // Return
  return Math.pow(ratio, Math.floor(point / base.length)) * base[rBase]
}

export default function create(scaleOptions?: ModularScaleOptions) {
  const opts = parseOpts(scaleOptions)
  const values: number[] = []

  for (let i = opts.pointRange[0]; i < opts.pointRange[1]; i += 1) {
    values.push(calcScale(i, opts))
  }

  return values
}
