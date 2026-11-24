import _ from 'lodash'

import { sequelize } from '../../db/dbConnection'
import { Organisation, Question, Survey, User } from '../../models'
import { ApplicationError } from '../../util/ApplicationError'
import { createOrganisationLog, createOrganisationSurveyLog } from '../auditLog'
import { getUserOrganisationAccess } from '../organisationAccess/organisationAccess'
import { logAfterSave, QuestionInput, saveSurveyQuestions, withNewPublicQuestions } from '../questions/saveQuestions'

const assertCanEdit = async (survey: Survey, user: User) => {
  if (survey.type === 'university') {
    if (!user.isAdmin) throw ApplicationError.Forbidden('Only admins can update university survey')
    return
  }
  if (survey.type !== 'programme') throw ApplicationError.Forbidden('Wrong endpoint for this survey')

  const organisationAccess = await getUserOrganisationAccess(user)
  const access = organisationAccess.find(({ organisation }) => organisation.code === survey.typeId)?.access
  if (!access?.write) throw ApplicationError.Forbidden('User does not have write access to this survey')
}

type UpdateQuestionsParams = {
  surveyId: number
  user: User
  questions: QuestionInput[]
  questionsVersion: number
}

export const updateSurveyQuestions = async ({ surveyId, user, questions, questionsVersion }: UpdateQuestionsParams) => {
  const survey = await Survey.findByPk(surveyId)
  if (!survey) throw ApplicationError.NotFound('Survey not found')
  await assertCanEdit(survey, user)
  const organisation =
    survey.type === 'programme' ? await Organisation.findOne({ where: { code: survey.typeId } }) : null

  const result = await sequelize.transaction(async transaction => {
    const locked = await Survey.findByPk(surveyId, { lock: transaction.LOCK.UPDATE, transaction })
    if (!locked) throw ApplicationError.NotFound('Survey not found')

    const previousQuestions = await Question.findAll({ where: { id: locked.questionIds }, transaction })
    const saved = await saveSurveyQuestions(locked, questions, questionsVersion, transaction)

    const lockedOrganisation =
      organisation && (await Organisation.findByPk(organisation.id, { lock: transaction.LOCK.UPDATE, transaction }))
    if (lockedOrganisation) {
      const publicQuestionIds = withNewPublicQuestions(lockedOrganisation.publicQuestionIds, questions, saved)
      if (!_.isEqual(publicQuestionIds, lockedOrganisation.publicQuestionIds)) {
        lockedOrganisation.publicQuestionIds = publicQuestionIds
        await lockedOrganisation.save({ transaction })
      }
    }

    return { ...saved, previousQuestions, publicQuestionIds: lockedOrganisation?.publicQuestionIds }
  })

  if (organisation) {
    await logAfterSave(async () => {
      await createOrganisationSurveyLog(
        survey,
        result.questions.map(q => q.toPublicObject()),
        user,
        result.previousQuestions
      )
      await createOrganisationLog(organisation, { publicQuestionIds: result.publicQuestionIds }, user)
    })
  }

  return {
    questions: result.questions.map(q => q.toPublicObject()),
    createdIds: result.createdIds,
    questionsVersion: result.questionsVersion,
  }
}
