import { format } from 'date-fns'

const integer = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 })

export const formatNumber = (value: number) => integer.format(value)

// Single questions cost fractions of a cent, so small sums keep four decimals
export const formatEuros = (value: number) => {
  if (value === 0) return '€0'
  return `€${value.toFixed(Math.abs(value) < 1 ? 4 : 2)}`
}

export const formatPercent = (part: number, whole: number) =>
  whole === 0 ? '–' : `${Math.round((100 * part) / whole)}%`

export const formatDateTime = (iso: string) => format(new Date(iso), 'd MMM yyyy HH:mm')

export const formatTime = (iso: string) => format(new Date(iso), 'HH:mm:ss')

export const formatDate = (iso: string) => format(new Date(iso), 'd MMM yyyy')

export const formatDuration = (ms: number | null) => (ms === null ? '–' : `${(ms / 1000).toFixed(1)} s`)

export const shortSha = (sha: string | null) => (sha === null ? 'development' : sha.slice(0, 7))
