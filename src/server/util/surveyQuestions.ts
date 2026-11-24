import _ from 'lodash'

import { ApplicationError } from './ApplicationError'

// Clients from before the separate question endpoints still send these, they must get an error, not a silent success
export const assertNoQuestionFields = (body: Record<string, unknown> | undefined) => {
  if (['questions', 'surveyId', 'publicQuestionIds'].some(key => body && key in body)) {
    throw ApplicationError.BadRequest('Questions are saved elsewhere, reload the page')
  }
}

export const assertOwnQuestionIds = (questions: { id?: number }[], surveyQuestionIds: number[]) => {
  const ids = questions.flatMap(q => (q.id ? [q.id] : []))

  if (ids.some(id => !surveyQuestionIds.includes(id))) {
    throw ApplicationError.BadRequest('Question does not belong to this survey')
  }
  if (_.uniq(ids).length !== ids.length) throw ApplicationError.BadRequest('Duplicate question')
}
