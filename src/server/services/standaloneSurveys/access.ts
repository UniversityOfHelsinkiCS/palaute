import type { StandaloneSurvey, User } from '../../models'

import { ApplicationError } from '../../util/ApplicationError'

export const getAccess = (survey: StandaloneSurvey, user: User) => {
  const isAdmin = user.isAdmin ?? false
  const isResponsibleUser = (survey.responsibleUsers ?? []).some(ru => ru.userId === user.id)

  const canEditBeforeOpening = isAdmin || (isResponsibleUser && !survey.hasOpened())

  return {
    isAdmin,
    canManage: isAdmin || isResponsibleUser,
    canEditQuestions: canEditBeforeOpening,
    canEditOpensAt: canEditBeforeOpening,
    canDeleteAnswers: isAdmin,
  }
}

export const assertCanManage = (survey: StandaloneSurvey, user: User) => {
  const access = getAccess(survey, user)
  if (!access.canManage) throw ApplicationError.Forbidden('Must be a responsible user or admin')
  return access
}
