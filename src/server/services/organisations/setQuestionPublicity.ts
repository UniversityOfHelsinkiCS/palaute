import _ from 'lodash'

import { Organisation, Survey, User } from '../../models'
import { ApplicationError } from '../../util/ApplicationError'
import { createOrganisationLog } from '../auditLog'
import { setPublicQuestionId } from '../questions/publicity'
import { logAfterSave } from '../questions/saveQuestions'
import { getUniversitySurvey } from '../surveys/universitySurvey'

type SetProgrammeQuestionPublicityParams = {
  organisation: Organisation
  user: User
  questionId: number
  isPublic: boolean
}

// Same rule as the programme survey editor: university questions that are public everywhere are fixed
const getConfigurableQuestionIds = async (organisationCode: string) => {
  const programmeSurvey = await Survey.findOne({ where: { type: 'programme', typeId: organisationCode } })
  const universitySurvey = await getUniversitySurvey(new Date())

  return _.difference(
    [...universitySurvey.questionIds, ...(programmeSurvey?.questionIds ?? [])],
    universitySurvey.publicQuestionIds ?? []
  )
}

export const setProgrammeQuestionPublicity = async ({
  organisation,
  user,
  questionId,
  isPublic,
}: SetProgrammeQuestionPublicityParams) => {
  if (!(await getConfigurableQuestionIds(organisation.code)).includes(questionId)) {
    throw ApplicationError.Forbidden('Publicity of this question cannot be changed')
  }

  const publicQuestionIds = await setPublicQuestionId(
    transaction => Organisation.findByPk(organisation.id, { lock: transaction.LOCK.UPDATE, transaction }),
    questionId,
    isPublic
  )

  await logAfterSave(() => createOrganisationLog(organisation, { publicQuestionIds }, user))

  return { publicQuestionIds }
}
