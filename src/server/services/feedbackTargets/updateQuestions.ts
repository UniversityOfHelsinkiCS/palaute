import _ from 'lodash'

import { sequelize } from '../../db/dbConnection'
import { FeedbackTarget, Survey } from '../../models'
import { User } from '../../models/user'
import { ApplicationError } from '../../util/ApplicationError'
import { createFeedbackTargetLog, createFeedbackTargetSurveyLog } from '../auditLog'
import { logAfterSave, QuestionInput, saveSurveyQuestions, withNewPublicQuestions } from '../questions/saveQuestions'
import { getFeedbackTargetContext } from './getFeedbackTargetContext'

// Matches the editor, which is hidden once the feedback has opened
const questionsLocked = (feedbackTarget: FeedbackTarget) =>
  !feedbackTarget.opensAt || !feedbackTarget.closesAt || feedbackTarget.opensAt <= new Date()

type UpdateQuestionsParams = {
  feedbackTargetId: number
  user: User
  questions: QuestionInput[]
  questionsVersion: number
}

export const updateTeacherSurveyQuestions = async ({
  feedbackTargetId,
  user,
  questions,
  questionsVersion,
}: UpdateQuestionsParams) => {
  const { feedbackTarget, access } = await getFeedbackTargetContext({ feedbackTargetId, user })

  if (!access?.canUpdate()) throw ApplicationError.Forbidden('No rights to update feedback target')
  if (!user.isAdmin && questionsLocked(feedbackTarget)) {
    throw ApplicationError.Forbidden('Questions cannot be changed once the feedback has opened')
  }

  const result = await sequelize.transaction(async transaction => {
    const survey = await Survey.findOne({ where: { feedbackTargetId }, lock: transaction.LOCK.UPDATE, transaction })
    if (!survey) throw ApplicationError.NotFound('Survey not found')

    const saved = await saveSurveyQuestions(survey, questions, questionsVersion, transaction)

    const target = await FeedbackTarget.findByPk(feedbackTargetId, { lock: transaction.LOCK.UPDATE, transaction })
    if (!target) throw ApplicationError.NotFound('Feedback target not found')

    const publicQuestionIds = withNewPublicQuestions(target.publicQuestionIds, questions, saved)
    if (!_.isEqual(publicQuestionIds, target.publicQuestionIds)) {
      target.publicQuestionIds = publicQuestionIds
      await target.save({ transaction })
    }

    return { ...saved, publicQuestionIds }
  })

  await logAfterSave(async () => {
    await createFeedbackTargetSurveyLog(feedbackTargetId, user, result.removedIds, result.newIds)
    await createFeedbackTargetLog(
      feedbackTarget,
      { publicQuestionIds: result.publicQuestionIds, questions: result.questions },
      user
    )
  })

  return {
    questions: result.questions.map(q => q.toPublicObject()),
    createdIds: result.createdIds,
    questionsVersion: result.questionsVersion,
  }
}
