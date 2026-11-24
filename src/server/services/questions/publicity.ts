import type { Transaction } from 'sequelize'

import _ from 'lodash'

import { sequelize } from '../../db/dbConnection'
import { ApplicationError } from '../../util/ApplicationError'

type PublicityRow = {
  publicQuestionIds: number[]
  save: (options: { transaction: Transaction }) => Promise<unknown>
}

export const setPublicQuestionId = (
  lockRow: (transaction: Transaction) => Promise<PublicityRow | null>,
  questionId: number,
  isPublic: boolean
) =>
  sequelize.transaction(async transaction => {
    const row = await lockRow(transaction)
    if (!row) throw ApplicationError.NotFound()

    const ids = isPublic ? _.union(row.publicQuestionIds, [questionId]) : _.without(row.publicQuestionIds, questionId)
    if (!_.isEqual(ids, row.publicQuestionIds)) {
      row.publicQuestionIds = ids
      await row.save({ transaction })
    }
    return ids
  })
