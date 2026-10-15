import type { HelpChatbotCost, HelpChatbotDateRange, HelpChatbotUsage } from '@common/types/helpChatbotAdmin'

import { QueryTypes } from 'sequelize'

import { sequelize } from '../../db/dbConnection'
import { inProduction } from '../../util/config'
import { PRICES } from './prices'

// User input only ever goes in as replacements

export type Replacements = Record<string, unknown>

export const TIME_ZONE = 'Europe/Helsinki'

export const select = <T extends object>(sql: string, replacements: Replacements) =>
  sequelize.query<T>(sql, { replacements, type: QueryTypes.SELECT })

// Conditions on help_chatbot_turns as t, joined with AND
export class Conditions {
  readonly sql: string[] = []

  readonly replacements: Replacements = {}

  add(sql: string, replacements: Replacements = {}) {
    this.sql.push(sql)
    Object.assign(this.replacements, replacements)
    return this
  }

  // A YYYY-MM-DD range of days in Helsinki time
  dateRange({ from, to }: Partial<HelpChatbotDateRange>) {
    if (from) this.add(`t.created_at >= CAST(:from AS timestamp) AT TIME ZONE '${TIME_ZONE}'`, { from })
    if (to) this.add(`t.created_at < CAST(CAST(:to AS date) + 1 AS timestamp) AT TIME ZONE '${TIME_ZONE}'`, { to })
    return this
  }

  // Mock turns are shown outside production. In production there shouldn't be any; this makes sure.
  withoutMockInProduction() {
    if (inProduction) this.add(`t.deployment IS DISTINCT FROM 'mock'`)
    return this
  }

  toSql() {
    return this.sql.length > 0 ? this.sql.join(' AND ') : 'TRUE'
  }
}

export const containsPattern = (text: string) => `%${text.replace(/[\\%_]/g, '\\$&')}%`

// The price table as rows, with the replacements it needs
const pricesValues = () => {
  const replacements: Replacements = {}
  const rows = PRICES.map((price, i) => {
    Object.assign(replacements, {
      [`family${i}`]: price.family,
      [`validFrom${i}`]: price.validFrom,
      [`validTo${i}`]: price.validTo,
      [`input${i}`]: price.input,
      [`cachedInput${i}`]: price.cachedInput,
      [`output${i}`]: price.output,
    })
    return `(:family${i}, CAST(:validFrom${i} AS timestamptz), CAST(:validTo${i} AS timestamptz),
      CAST(:input${i} AS float8), CAST(:cachedInput${i} AS float8), CAST(:output${i} AS float8))`
  })
  return { sql: rows.join(',\n'), replacements }
}

// WITH clauses defining `turns`: the turns matching `conditions` with their costs in euros, null without usage or
// a price. output_cost excludes the reasoning, which is billed at the output price. Costs are floats: exact
// decimals made the sums much slower.
export const pricedTurns = (conditions: Conditions) => {
  const prices = pricesValues()
  const sql = `
    prices (family, valid_from, valid_to, input, cached_input, output) AS (
      VALUES ${prices.sql}
    ),
    turns AS (
      SELECT
        t.*,
        (t.prompt_tokens - t.cached_tokens) * p.input / 1000000 AS input_cost,
        t.cached_tokens * p.cached_input / 1000000 AS cached_cost,
        (t.completion_tokens - t.reasoning_tokens) * p.output / 1000000 AS output_cost,
        t.reasoning_tokens * p.output / 1000000 AS reasoning_cost,
        t.prompt_tokens IS NOT NULL AND p.family IS NULL AS unpriced
      FROM help_chatbot_turns t
      -- Azure reports the model with its version date, e.g. gpt-5-mini-2025-08-07. LIKE rather than a regular
      -- expression, which made a query over 200 000 turns several times slower.
      LEFT JOIN prices p
        ON (t.model = p.family OR t.model LIKE p.family || '-____-__-__')
        AND t.created_at >= p.valid_from
        AND (p.valid_to IS NULL OR t.created_at < p.valid_to)
      WHERE ${conditions.toSql()}
    )`
  return { sql, replacements: { ...prices.replacements, ...conditions.replacements } }
}

// Aggregates of `turns` as t. count(t.id), not count(*), so a left-joined period without turns counts zero.
// Conversations are counted separately: a count(DISTINCT) per group was the slowest part of the usage queries.
export const USAGE_COLUMNS = `
  count(t.id) AS "questions",
  count(t.id) FILTER (WHERE t.status = 'answered') AS "answered",
  count(t.id) FILTER (WHERE t.status = 'empty') AS "empty",
  count(t.id) FILTER (WHERE t.status = 'failed') AS "failed",
  count(t.id) FILTER (WHERE t.status = 'aborted') AS "aborted",
  count(t.id) FILTER (WHERE t.status = 'pending') AS "pending",
  count(t.id) FILTER (WHERE t.rating = 'up') AS "up",
  count(t.id) FILTER (WHERE t.rating = 'down') AS "down",
  count(t.prompt_tokens) AS "billed",
  coalesce(sum(t.prompt_tokens), 0) AS "promptTokens",
  coalesce(sum(t.cached_tokens), 0) AS "cachedTokens",
  coalesce(sum(t.completion_tokens), 0) AS "completionTokens",
  coalesce(sum(t.reasoning_tokens), 0) AS "reasoningTokens",
  avg(t.duration_ms) FILTER (WHERE t.prompt_tokens IS NOT NULL) AS "avgDurationMs",
  coalesce(sum(t.input_cost), 0) AS "inputCost",
  coalesce(sum(t.cached_cost), 0) AS "cachedCost",
  coalesce(sum(t.output_cost), 0) AS "outputCost",
  coalesce(sum(t.reasoning_cost), 0) AS "reasoningCost",
  count(t.id) FILTER (WHERE t.unpriced) AS "unpricedTurns"`

// Postgres returns counts and sums as strings
type NumericValue = string | number | null

export type UsageRow = Record<Exclude<keyof HelpChatbotUsage, 'cost'>, NumericValue> & {
  inputCost: NumericValue
  cachedCost: NumericValue
  outputCost: NumericValue
  reasoningCost: NumericValue
  unpricedTurns: NumericValue
}

export const toNumber = (value: NumericValue) => Number(value ?? 0)

export const toCost = (row: UsageRow): HelpChatbotCost => {
  const cost = {
    input: toNumber(row.inputCost),
    cachedInput: toNumber(row.cachedCost),
    output: toNumber(row.outputCost),
    reasoning: toNumber(row.reasoningCost),
  }
  return {
    ...cost,
    total: cost.input + cost.cachedInput + cost.output + cost.reasoning,
    unpricedTurns: toNumber(row.unpricedTurns),
  }
}

export const toUsage = (row: UsageRow): HelpChatbotUsage => ({
  questions: toNumber(row.questions),
  answered: toNumber(row.answered),
  empty: toNumber(row.empty),
  failed: toNumber(row.failed),
  aborted: toNumber(row.aborted),
  pending: toNumber(row.pending),
  up: toNumber(row.up),
  down: toNumber(row.down),
  billed: toNumber(row.billed),
  promptTokens: toNumber(row.promptTokens),
  cachedTokens: toNumber(row.cachedTokens),
  completionTokens: toNumber(row.completionTokens),
  reasoningTokens: toNumber(row.reasoningTokens),
  avgDurationMs: row.avgDurationMs === null ? null : Math.round(toNumber(row.avgDurationMs)),
  cost: toCost(row),
})

// Timestamps from raw queries are Dates
export const toIso = (value: Date | string) => (value instanceof Date ? value.toISOString() : value)
