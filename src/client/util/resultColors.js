// Color spec: above 4.5 its awesome, below 2 its terrible. In between, 7 hues in equal steps
const MAX = 4.5
const MIN = 2.0 // Below min everything is the "worst" color
const COLORS = [
  '#d5d6f0',
  '#c9586f',
  '#e66067',
  '#f57368',
  '#fb8c6e',
  '#fba678',
  '#dbda7d',
  '#9ec27c',
  '#60a866',
  '#008c59',
]

const getColorIndex = (mean) => {
  if (mean < 1.0) return 0 // Case: no data
  if (mean < MIN) return 1 // Case: bad
  if (mean >= MAX) return COLORS.length - 1 // Case: awesome

  // map range MIN-MAX to 0-8
  // Adding 0.01 there because we want 2.00 not to hit 0, but 1
  const index = Math.ceil(
    ((mean + 0.01 - MIN) / (MAX - MIN)) * (COLORS.length - 2) + 1,
  )
  return index
}

export const getColor = (mean) => COLORS[getColorIndex(mean)]
