import { StandaloneSurveyLog, User } from '../../models'

export const createLog = async (standaloneSurveyId: number, user: User, data: Record<string, unknown>) => {
  if (Object.keys(data).length === 0) return

  const logData: Record<string, unknown> = { ...data }
  if (user.mockedBy) {
    logData.mockedBy = user.mockedBy.username
  }

  await StandaloneSurveyLog.create({ standaloneSurveyId, userId: user.id, data: logData })
}

export const getLogs = (standaloneSurveyId: number) =>
  StandaloneSurveyLog.findAll({
    where: { standaloneSurveyId },
    include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }],
    order: [['createdAt', 'DESC']],
  })
