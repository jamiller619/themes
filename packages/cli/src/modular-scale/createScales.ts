import debug from 'debug'
import calcModifier from '~/utils/calcModifier'
import ratios from './ratios'

const log = debug('modular-scale.create')

export type ModularScaleOptions = {
  base?: string | number | string[] | number[]
  unit?: string
  ratio?: string | number
  points?: string | number
  pointStart?: string | number
  field?: string
  fields?: string[]
}

const defaultOptions = {
  base: 16,
  ratio: ratios.perfectFifth,
  points: 10,
  pointStart: -3,
}

const toCamelCase = (str: string) => {
  return str.replace(/-([a-z])/gi, function (_, group) {
    return group.toUpperCase()
  })
}

const parseRatio = (ratio?: string | number) => {
  const raw = ratio ?? defaultOptions.ratio

  if (typeof raw === 'string' && raw.includes('-')) {
    log(`Found hyphen-cased ratio "${raw}"`)
    const camelCased = toCamelCase(raw) as keyof typeof ratios

    log(`Camel cased: "${camelCased}"`)

    return ratios[camelCased]
  }

  return typeof raw === 'string' ? ratios[raw as keyof typeof ratios] : raw
}

const parseOpts = (opts?: ModularScaleOptions) => {
  const base = opts?.base ?? defaultOptions.base
  const ratio = parseRatio(opts?.ratio)

  if (ratio == null) {
    throw new Error(`Unknown ratio "${opts?.ratio}"`)
  }

  const points = Number(opts?.points ?? defaultOptions.points)
  const pointStart = Number(opts?.pointStart ?? defaultOptions.pointStart)
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
    const bv = Number(isBaseArr ? base[0] : base)

    return Math.pow(ratio, point) * bv
  }

  // Normalize bases
  const nbase = [...base.map(Number)]
  // Find the upper bounds for base values
  const baseHigh = Math.pow(ratio, 1) * nbase[0]
  for (let i = 1; i < base.length; i++) {
    // shift up if value too low
    while (nbase[i] / 1 < nbase[0] / 1) {
      nbase[i] = Math.pow(ratio, 1) * nbase[i]
    }
    // Shift down if too high
    while (nbase[i] / 1 >= baseHigh / 1) {
      nbase[i] = Math.pow(ratio, -1) * nbase[i]
    }
  }

  // Sort bases
  nbase.sort()

  // Figure out what base to use with modulo
  const rBase = Math.round(
    (point / nbase.length - Math.floor(point / nbase.length)) * nbase.length
  )

  // Return
  return Math.pow(ratio, Math.floor(point / nbase.length)) * nbase[rBase]
}

export default function create(scaleOptions?: ModularScaleOptions) {
  const opts = parseOpts(scaleOptions)

  log('Parsed opts %O', opts)

  const values: Record<string, string> = {}
  const unit = scaleOptions?.unit ?? 'px'

  for (let i = opts.pointRange[0]; i < opts.pointRange[1]; i += 1) {
    const scale = Number(calcScale(i, opts).toFixed(3))
    const modifier = calcModifier(i)

    log(scale, modifier)

    values[modifier] = `${scale}${unit}`
  }

  return values
}
