import { StandaloneSurveyLog, User } from '../../models'
import { withMockedBy } from '../auditLog/withMockedBy'

export const createLog = async (standaloneSurveyId: number, user: User, data: Record<string, unknown>) => {
  if (Object.keys(data).length === 0) return

  await StandaloneSurveyLog.create({ standaloneSurveyId, userId: user.id, data: withMockedBy(user, data) })
}

export const getLogs = (standaloneSurveyId: number) =>
  StandaloneSurveyLog.findAll({
    where: { standaloneSurveyId },
    include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }],
    order: [['createdAt', 'DESC']],
  })
