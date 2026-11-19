import { describe, expect, it } from 'vitest'

import { buildPriceTable } from './prices'

const PRICES = { input: 1, cachedInput: 0.1, cacheWrite: 1.25, output: 5 }

describe('buildPriceTable', () => {
  it("runs each entry until its family's next one", () => {
    const table = buildPriceTable([
      { family: 'model-a', validFrom: '2026-06-01T00:00:00Z', currency: 'EUR', ...PRICES },
      { family: 'model-b', validFrom: '2026-02-01T00:00:00Z', currency: 'EUR', ...PRICES },
      { family: 'model-a', validFrom: '2026-01-01T00:00:00Z', currency: 'EUR', ...PRICES },
    ])

    expect(table.map(({ family, validFrom, validTo }) => [family, validFrom, validTo])).toEqual([
      ['model-a', '2026-01-01T00:00:00Z', '2026-06-01T00:00:00Z'],
      ['model-a', '2026-06-01T00:00:00Z', null],
      ['model-b', '2026-02-01T00:00:00Z', null],
    ])
  })
})
