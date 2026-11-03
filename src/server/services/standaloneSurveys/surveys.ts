import type { LocalizedString } from '@common/types/common'

import { randomBytes } from 'crypto'
import _ from 'lodash'
import { Op } from 'sequelize'

import { sequelize } from '../../db/dbConnection'
import { StandaloneSurvey, StandaloneSurveyResponse, StandaloneSurveyResponsibleUser, User } from '../../models'
import { ApplicationError } from '../../util/ApplicationError'
import { createLog } from './logs'

const generateToken = () => randomBytes(9).toString('base64url')

const assertDates = (opensAt: Date, closesAt: Date) => {
  if (!(opensAt < closesAt)) throw ApplicationError.BadRequest('Survey must close after it opens')
}

const assertUsersExist = async (userIds: string[]) => {
  if (userIds.length === 0) throw ApplicationError.BadRequest('At least one responsible user is required')
  const count = await User.count({ where: { id: userIds } })
  if (count !== userIds.length) throw ApplicationError.BadRequest('Unknown user')
}

type CreateSurveyParams = {
  name: LocalizedString
  opensAt: Date
  closesAt: Date
  responsibleUserIds: string[]
  user: User
}

export const createSurvey = async ({ name, opensAt, closesAt, responsibleUserIds, user }: CreateSurveyParams) => {
  const userIds = _.uniq(responsibleUserIds)
  assertDates(opensAt, closesAt)
  await assertUsersExist(userIds)

  const survey = await sequelize.transaction(async transaction => {
    const created = await StandaloneSurvey.create(
      { name, opensAt, closesAt, token: generateToken(), createdByUserId: user.id },
      { transaction }
    )
    await StandaloneSurveyResponsibleUser.bulkCreate(
      userIds.map(userId => ({ standaloneSurveyId: created.id, userId })),
      { transaction }
    )
    return created
  })

  await createLog(survey.id, user, { created: true, opensAt, closesAt })

  return survey
}

type UpdateSurveyParams = {
  name?: LocalizedString
  opensAt?: Date
  closesAt?: Date
}

export const updateSurvey = async (
  survey: StandaloneSurvey,
  { name, opensAt, closesAt }: UpdateSurveyParams,
  user: User
) => {
  const opensAtChanged = opensAt && opensAt.getTime() !== survey.opensAt.getTime()
  const closesAtChanged = closesAt && closesAt.getTime() !== survey.closesAt.getTime()

  if (opensAtChanged && survey.opensAt <= new Date() && !user.isAdmin) {
    throw ApplicationError.Forbidden('Opening date cannot be changed once the survey is open')
  }

  assertDates(opensAt ?? survey.opensAt, closesAt ?? survey.closesAt)

  const logData: Record<string, unknown> = {}
  if (name && !_.isEqual(name, survey.name)) {
    survey.name = name
    logData.name = name
  }
  if (opensAtChanged) {
    survey.opensAt = opensAt
    logData.opensAt = opensAt
  }
  if (closesAtChanged) {
    survey.closesAt = closesAt
    logData.closesAt = closesAt
  }

  await survey.save()
  await createLog(survey.id, user, logData)

  return survey
}

export const setResponsibleUsers = async (survey: StandaloneSurvey, responsibleUserIds: string[], user: User) => {
  const userIds = _.uniq(responsibleUserIds)
  await assertUsersExist(userIds)

  const currentIds = (survey.responsibleUsers ?? []).map(ru => ru.userId)
  const added = _.difference(userIds, currentIds)
  const removed = _.difference(currentIds, userIds)

  await sequelize.transaction(async transaction => {
    if (removed.length > 0) {
      await StandaloneSurveyResponsibleUser.destroy({
        where: { standaloneSurveyId: survey.id, userId: removed },
        transaction,
      })
    }
    if (added.length > 0) {
      await StandaloneSurveyResponsibleUser.bulkCreate(
        added.map(userId => ({ standaloneSurveyId: survey.id, userId })),
        { transaction }
      )
    }
  })

  const toLogUsers = (ids: string[]) =>
    User.findAll({ where: { id: ids }, attributes: ['id', 'firstName', 'lastName', 'email'] })

  const logData: Record<string, unknown> = {}
  if (added.length > 0) logData.addedResponsibleUsers = await toLogUsers(added)
  if (removed.length > 0) logData.removedResponsibleUsers = await toLogUsers(removed)
  await createLog(survey.id, user, logData)
}

export const deleteSurvey = async (survey: StandaloneSurvey) => {
  const responseCount = await StandaloneSurveyResponse.count({ where: { standaloneSurveyId: survey.id } })
  if (responseCount > 0) throw ApplicationError.BadRequest('A survey with answers cannot be deleted')

  await survey.destroy()
}

const getResponseCounts = async (surveyIds: number[]) => {
  const rows = (await StandaloneSurveyResponse.findAll({
    where: { standaloneSurveyId: surveyIds },
    attributes: ['standaloneSurveyId', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    group: ['standaloneSurveyId'],
    raw: true,
  })) as unknown as { standaloneSurveyId: number; count: string }[]

  return Object.fromEntries(rows.map(r => [r.standaloneSurveyId, Number(r.count)]))
}

const toListItem = (survey: StandaloneSurvey, counts: Record<number, number>) => ({
  id: survey.id,
  name: survey.name,
  opensAt: survey.opensAt,
  closesAt: survey.closesAt,
  responseCount: counts[survey.id] ?? 0,
})

export const getAllSurveys = async () => {
  const surveys = await StandaloneSurvey.findAll({ order: [['opensAt', 'DESC']] })
  const counts = await getResponseCounts(surveys.map(s => s.id))
  return surveys.map(s => toListItem(s, counts))
}

export const getSurveysForResponsibleUser = async (user: User) => {
  const links = await StandaloneSurveyResponsibleUser.findAll({
    where: { userId: user.id },
    attributes: ['standaloneSurveyId'],
  })
  const surveys = await StandaloneSurvey.findAll({
    where: { id: { [Op.in]: links.map(l => l.standaloneSurveyId) } },
    order: [['opensAt', 'DESC']],
  })
  const counts = await getResponseCounts(surveys.map(s => s.id))
  return surveys.map(s => toListItem(s, counts))
}
