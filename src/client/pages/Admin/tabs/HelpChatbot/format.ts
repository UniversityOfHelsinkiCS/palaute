import type { HelpChatbotCurrency } from '@common/types/helpChatbotAdmin'

import { format } from 'date-fns'

const integer = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 })

export const formatNumber = (value: number) => integer.format(value)

export const CURRENCY_SYMBOLS: Record<HelpChatbotCurrency, string> = { EUR: '€', USD: '$' }

// Single questions cost fractions of a cent, so small sums keep four decimals
export const formatMoney = (value: number, currency: HelpChatbotCurrency) => {
  const symbol = CURRENCY_SYMBOLS[currency]
  if (value === 0) return `${symbol}0`
  return `${symbol}${value.toFixed(Math.abs(value) < 1 ? 4 : 2)}`
}

// Costs aren't converted, so a sum in several currencies shows each
export const formatAmounts = (amounts: Partial<Record<HelpChatbotCurrency, number>>) => {
  const entries = Object.entries(amounts) as [HelpChatbotCurrency, number][]
  return entries.length === 0 ? '–' : entries.map(([currency, value]) => formatMoney(value, currency)).join(' + ')
}

export const formatPercent = (part: number, whole: number) =>
  whole === 0 ? '–' : `${Math.round((100 * part) / whole)}%`

export const formatDateTime = (iso: string) => format(new Date(iso), 'd MMM yyyy HH:mm')

// Not a date-fns pattern: the translations check reads a quoted HH:mm:ss pattern as a translation key
export const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('en-GB')

export const formatDate = (iso: string) => format(new Date(iso), 'd MMM yyyy')

export const formatDuration = (ms: number | null) => (ms === null ? '–' : `${(ms / 1000).toFixed(1)} s`)

export const shortSha = (sha: string | null) => (sha === null ? 'development' : sha.slice(0, 7))
