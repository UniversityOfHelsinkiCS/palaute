import type { HelpChatbotCurrency, HelpChatbotPrice } from '@common/types/helpChatbotAdmin'

export const CURRENCIES: HelpChatbotCurrency[] = ['EUR', 'USD']

// Per million tokens, as quoted: Anthropic in dollars, and Azure, which answered until November 2026, in euros. Costs are summed
// in each currency, not converted. To change a price, add an entry with a later validFrom rather than editing one:
// each turn is priced with the price valid when it was asked. A model without a separate cache write price has it
// at the input price.
type PriceEntry = Omit<HelpChatbotPrice, 'validTo'>

const PRICE_ENTRIES: PriceEntry[] = [
  // For the turns answered through Azure
  {
    family: 'gpt-5-mini',
    validFrom: '2026-01-01T00:00:00Z',
    currency: 'EUR',
    input: 0.25,
    cachedInput: 0.03,
    cacheWrite: 0.25,
    output: 1.94,
  },
  // Cache writes are for the 5-minute cache, which is all the chatbot uses
  {
    family: 'claude-haiku-5-5',
    validFrom: '2026-10-30T00:00:00Z',
    currency: 'USD',
    // For prompts up to 100 000 tokens
    input: 0.1,
    cachedInput: 0.01,
    cacheWrite: 0.125,
    output: 0.5,
  },
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
