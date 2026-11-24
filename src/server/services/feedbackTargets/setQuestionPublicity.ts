import { FeedbackTarget } from '../../models'
import { User } from '../../models/user'
import { ApplicationError } from '../../util/ApplicationError'
import { createFeedbackTargetLog } from '../auditLog'
import { setPublicQuestionId } from '../questions/publicity'
import { logAfterSave } from '../questions/saveQuestions'
import { getFeedbackTargetSurveys } from '../surveys/getFeedbackTargetSurveys'
import { getFeedbackTargetContext } from './getFeedbackTargetContext'

type SetQuestionPublicityParams = {
  feedbackTargetId: number
  user: User
  questionId: number
  isPublic: boolean
}

export const setQuestionPublicity = async ({
  feedbackTargetId,
  user,
  questionId,
  isPublic,
}: SetQuestionPublicityParams) => {
  const { feedbackTarget, access } = await getFeedbackTargetContext({ feedbackTargetId, user })
  if (!access?.canUpdate()) throw ApplicationError.Forbidden('No rights to update feedback target')

  const surveys = await getFeedbackTargetSurveys(feedbackTarget)
  feedbackTarget.populateSurveys(surveys)

  const question = feedbackTarget.questions?.find(q => q.id === questionId)
  if (!question) throw ApplicationError.BadRequest('Question does not belong to this feedback target')
  if (
    question.secondaryType === 'GROUPING' ||
    !feedbackTarget.getPublicityConfigurableQuestionIds(surveys).includes(questionId)
  ) {
    throw ApplicationError.Forbidden('Publicity of this question cannot be changed')
  }
  if (isPublic && question.type === 'OPEN' && feedbackTarget.isOpen()) {
    throw ApplicationError.Forbidden('Open answers can be published only after the feedback has closed')
  }

  const publicQuestionIds = await setPublicQuestionId(
    transaction => FeedbackTarget.findByPk(feedbackTargetId, { lock: transaction.LOCK.UPDATE, transaction }),
    questionId,
    isPublic
  )

  await logAfterSave(() => createFeedbackTargetLog(feedbackTarget, { publicQuestionIds }, user))

  feedbackTarget.publicQuestionIds = publicQuestionIds
  return { publicQuestionIds: feedbackTarget.getPublicQuestionIds(surveys) }
}
