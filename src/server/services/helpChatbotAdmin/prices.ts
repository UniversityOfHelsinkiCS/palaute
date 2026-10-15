import type { HelpChatbotPrice } from '@common/types/helpChatbotAdmin'

// € per million tokens, as agreed for our Azure subscription. To change a price, add an entry with a later
// validFrom rather than editing one: each turn is priced with the price valid when it was asked.
type PriceEntry = Omit<HelpChatbotPrice, 'validTo'>

const PRICE_ENTRIES: PriceEntry[] = [
  { family: 'gpt-5-mini', validFrom: '2026-01-01T00:00:00Z', input: 0.25, cachedInput: 0.03, output: 1.94 },
]

// Each entry runs until the family's next one
export const buildPriceTable = (entries: PriceEntry[]): HelpChatbotPrice[] =>
  [...entries]
    .sort((a, b) => a.family.localeCompare(b.family) || a.validFrom.localeCompare(b.validFrom))
    .map((entry, i, sorted) => {
      const next = sorted[i + 1]
      return { ...entry, validTo: next?.family === entry.family ? next.validFrom : null }
    })

export const PRICES = buildPriceTable(PRICE_ENTRIES)
