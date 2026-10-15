import type { GetHelpChatbotUsageQuery, GetHelpChatbotUsageResponse } from '@common/types/helpChatbotAdmin'

import type { UsageRow } from './sql'

import { PRICES } from './prices'
import { Conditions, pricedTurns, select, TIME_ZONE, toIso, toNumber, toUsage, USAGE_COLUMNS } from './sql'

type PeriodRow = UsageRow & { start: string }

type VersionRow = UsageRow & { gitSha: string | null; models: string[]; firstAt: Date; lastAt: Date }

// Periods are days, weeks (from Monday) or months in Helsinki time
export const getUsage = async (query: GetHelpChatbotUsageQuery): Promise<GetHelpChatbotUsageResponse> => {
  const groupBy = query.groupBy ?? 'day'
  const conditions = new Conditions().dateRange(query).withoutMockInProduction()
  const turns = pricedTurns(conditions)
  const replacements = { ...turns.replacements, unit: groupBy, step: `1 ${groupBy}` }

  const [[totals], [{ conversations }], periods, versions] = await Promise.all([
    select<UsageRow>(`WITH ${turns.sql} SELECT ${USAGE_COLUMNS} FROM turns t`, replacements),
    select<{ conversations: string | number }>(
      `SELECT count(*) AS conversations
       FROM (SELECT DISTINCT t.conversation_id, t.user_id FROM help_chatbot_turns t WHERE ${conditions.toSql()}) c`,
      conditions.replacements
    ),
    // Every period in the range, so the chart shows the quiet ones too
    select<PeriodRow>(
      `
      WITH ${turns.sql},
      periods AS (
        SELECT generate_series(
          date_trunc(:unit, CAST(:from AS timestamp)),
          date_trunc(:unit, CAST(:to AS timestamp)),
          CAST(:step AS interval)
        ) AS start
      )
      SELECT to_char(p.start, 'YYYY-MM-DD') AS start, ${USAGE_COLUMNS}
      FROM periods p
      LEFT JOIN turns t ON date_trunc(:unit, t.created_at AT TIME ZONE '${TIME_ZONE}') = p.start
      GROUP BY p.start
      ORDER BY p.start
      `,
      replacements
    ),
    select<VersionRow>(
      `
      WITH ${turns.sql}
      SELECT
        t.git_sha AS "gitSha",
        array_remove(array_agg(DISTINCT t.model), NULL) AS models,
        min(t.created_at) AS "firstAt",
        max(t.created_at) AS "lastAt",
        ${USAGE_COLUMNS}
      FROM turns t
      GROUP BY t.git_sha
      ORDER BY min(t.created_at) DESC
      `,
      replacements
    ),
  ])

  return {
    totals: { ...toUsage(totals), conversations: toNumber(conversations) },
    periods: periods.map(row => ({ start: row.start, ...toUsage(row) })),
    versions: versions.map(row => ({
      gitSha: row.gitSha,
      models: row.models,
      firstAt: toIso(row.firstAt),
      lastAt: toIso(row.lastAt),
      ...toUsage(row),
    })),
    prices: PRICES,
  }
}
