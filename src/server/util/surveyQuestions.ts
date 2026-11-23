import _ from 'lodash'

import { ApplicationError } from './ApplicationError'

export const assertOwnQuestionIds = (questions: { id?: number | null }[], surveyQuestionIds: number[]) => {
  const ids = questions.flatMap(q => (q.id ? [q.id] : []))

  if (ids.some(id => !surveyQuestionIds.includes(id))) {
    throw ApplicationError.BadRequest('Question does not belong to this survey')
  }
  if (_.uniq(ids).length !== ids.length) throw ApplicationError.BadRequest('Duplicate question')
}
