import type { NorppaiPrice } from '@common/types/helpChatbotAdmin'

// Prices of the models behind the help chatbot, in € per million tokens, as agreed for our Azure subscription.
// family is the model without the version date Azure adds, e.g. gpt-5-mini for gpt-5-mini-2025-08-07.
// When a price changes, end the old entry by adding a new one with a later validFrom: costs are always computed
// with the price that was valid when the question was asked. Cached input is part of the input tokens but
// priced on its own, and output includes the reasoning tokens.
type PriceEntry = Omit<NorppaiPrice, 'validTo'>

const PRICE_ENTRIES: PriceEntry[] = [
  { family: 'gpt-5-mini', validFrom: '2026-01-01T00:00:00Z', input: 0.25, cachedInput: 0.03, output: 1.94 },
]

// Each entry runs until the family's next one
export const buildPriceTable = (entries: PriceEntry[]): NorppaiPrice[] =>
  [...entries]
    .sort((a, b) => a.family.localeCompare(b.family) || a.validFrom.localeCompare(b.validFrom))
    .map((entry, i, sorted) => {
      const next = sorted[i + 1]
      return { ...entry, validTo: next?.family === entry.family ? next.validFrom : null }
    })

export const PRICES = buildPriceTable(PRICE_ENTRIES)
