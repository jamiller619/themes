export default function calcModifier(idx: number) {
  const numx = Math.abs(idx) - 0 - 1
  const size = idx === 0 ? 'm' : idx > 0 ? 'l' : 's'

  if (numx > 0) {
    return `${new Array(numx)
      .fill('x')
      .reduce((a, c) => `${a}${c}`, '')}${size}`
  }

  return size
}
