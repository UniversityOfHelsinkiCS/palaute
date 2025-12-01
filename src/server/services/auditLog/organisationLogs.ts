import { Op } from 'sequelize'
import _ from 'lodash'
import { OrganisationLog, Organisation, Question, User } from '../../models'

const createFromData = async (organisationId: string, user: User, data: object) => {
  const logData: any = { ...data }
  if (user.mockedBy) {
    logData.mockedBy = user.mockedBy.username
  }

  const log = await OrganisationLog.create({
    data: logData,
    organisationId,
    userId: user.id,
  })

  return log
}

export const createOrganisationSurveyLog = async (survey: any, questions: any[], user: User) => {
  let previousQuestions: any[] = await Question.findAll({
    where: {
      id: { [Op.in]: survey.questionIds },
    },
    attributes: ['id', 'type', 'data', 'required'],
  })
  previousQuestions = previousQuestions.map(question => question.dataValues)

  questions = questions.map(({ id, type, data, required }) => ({
    id,
    type,
    data,
    required,
  }))

  const organisation = await Organisation.findOne({
    where: {
      code: survey.typeId,
    },
    attributes: ['id'],
  })

  const deletedQuestions = previousQuestions.filter(question => !questions.find(q => q.id === question.id))

  for (const question of deletedQuestions) {
    const data = {
      deleteQuestion: {
        id: question.id,
        type: question.type,
        ...question.data,
      },
    }

    await OrganisationLog.create({
      data,
      organisationId: organisation.id,
      userId: user.id,
    })
  }

  for (const question of questions) {
    let data
    if (question.id) {
      const previousQuestion = previousQuestions.find(q => q.id === question.id)
      // Get the changed values of the question
      const difference = _.fromPairs(_.differenceWith(_.toPairs(question), _.toPairs(previousQuestion), _.isEqual))
      // eslint-disable-next-line no-continue
      if (Object.keys(difference).length === 0) continue

      const label = previousQuestion.data.label || previousQuestion.data.content
      data = {
        updateQuestion: {
          id: question.id,
          previousLabel: label && (label.en || label.fi || label.sv),
          ...difference,
        },
      }
    } else {
      data = {
        createQuestion: {
          id: question.id,
          ...question.data,
          type: question.type,
          required: question.required,
        },
      }
    }

    if (Object.keys(data).length > 0) {
      await createFromData(organisation.id, user, data)
    }
  }
}

export const createOrganisationLog = async (organisation: Organisation, updates: any, user: User) => {
  const data: any = {}

  if (Array.isArray(updates.disabledCourseCodes)) {
    data.disabledCourseCodes = _.difference(updates.disabledCourseCodes, organisation.disabledCourseCodes)
    data.enabledCourseCodes = _.difference(organisation.disabledCourseCodes, updates.disabledCourseCodes)
  }

  if (Array.isArray(updates.studentListVisibleCourseCodes)) {
    data.enabledStudentList = _.difference(
      updates.studentListVisibleCourseCodes,
      organisation.studentListVisibleCourseCodes
    )
    data.disabledStudentList = _.difference(
      organisation.studentListVisibleCourseCodes,
      updates.studentListVisibleCourseCodes
    )
  }

  if (Array.isArray(updates.publicQuestionIds)) {
    data.addedPublicQuestionIds = _.difference(updates.publicQuestionIds, organisation.publicQuestionIds)
    data.removedPublicQuestionIds = _.difference(organisation.publicQuestionIds, updates.publicQuestionIds)
  }

  if (updates.studentListVisible !== undefined) data.studentListVisible = Boolean(updates.studentListVisible)

  if (updates.newFeedbackCorrespondent !== undefined) {
    data.newFeedbackCorrespondent = await User.findByPk(updates.newFeedbackCorrespondent, {
      attributes: ['id', 'firstName', 'lastName'],
    })
  }

  if (updates.removedFeedbackCorrespondent !== undefined) {
    data.removedFeedbackCorrespondent = await User.findByPk(updates.removedFeedbackCorrespondent, {
      attributes: ['id', 'firstName', 'lastName'],
    })
  }

  if (Object.keys(data).length === 0) return

  await createFromData(organisation.id, user, data)
}
