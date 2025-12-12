import _ from 'lodash'
import {
  FeedbackTarget,
  CourseUnit,
  Organisation,
  CourseRealisation,
  UserFeedbackTarget,
  Feedback,
  User,
  Tag,
  Group,
  Summary,
} from '../../models'
import { ApplicationError } from '../../util/ApplicationError'
import cache from './feedbackTargetCache'
import { getAccess } from './getAccess'
import { getFeedbackTargetSurveys } from '../surveys/getFeedbackTargetSurveys'
import { User as UserType } from '../../models/user'

const populateGroupInformation = (feedbackTarget: FeedbackTarget) => {
  for (const group of feedbackTarget.groups ?? []) {
    const teachers = feedbackTarget.userFeedbackTargets.filter(
      ufbt => ufbt.groupIds?.includes(group.id) && ufbt.hasTeacherAccess()
    )
    group.set(
      'teachers',
      _.orderBy(
        teachers.map(ufbt => ufbt.user),
        'lastName'
      )
    )
    const students = feedbackTarget.userFeedbackTargets.filter(
      ufbt => ufbt.groupIds?.includes(group.id) && ufbt.hasStudentAccess()
    )
    group.set('studentCount', students.length)
  }
}

/**
 * Expensive data of feedback targets is cached:
 * - courseUnit
 * - organisations
 * - courseRealisation
 * - groups
 * - studentCount
 * - surveys
 * - responsibleTeachers
 * - studentListVisible
 * @param {number} id
 * @returns {Promise<object>}
 */
const getFromDb = async (id: number | string) => {
  const fbt = await FeedbackTarget.findByPk(id, {
    attributes: [
      'id',
      'courseUnitId',
      'courseRealisationId',
      'hidden',
      'feedbackType',
      'publicQuestionIds',
      'userCreated',
    ],
    include: [
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        separate: true,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
      },
      {
        model: Summary,
        as: 'summary',
      },
      {
        model: CourseUnit,
        as: 'courseUnit',
        required: true,
        include: [
          {
            model: Organisation,
            as: 'organisations',
            through: { attributes: ['type'], as: 'courseUnitOrganisation' },
            required: true,
          },
          {
            model: Tag,
            as: 'tags',
            attributes: ['id', 'name', 'hash'],
            through: { attributes: [] },
          },
        ],
      },
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        required: true,
        include: [
          {
            model: Tag,
            as: 'tags',
            attributes: ['id', 'name', 'hash'],
            through: { attributes: [] },
          },
        ],
      },
      {
        model: Group,
        as: 'groups',
        required: false,
        separate: true,
      },
    ],
  })
  if (!fbt) throw ApplicationError.NotFound(`FeedbackTarget ${id} doesn't exist`)

  fbt.set(
    'administrativePersons',
    _.orderBy(
      fbt.userFeedbackTargets.filter(ufbt => ufbt.isAdministrativePerson).map(ufbt => ufbt.user),
      'lastName'
    )
  )
  fbt.set(
    'responsibleTeachers',
    _.orderBy(
      fbt.userFeedbackTargets
        .filter(ufbt => ufbt.accessStatus === 'RESPONSIBLE_TEACHER' && !ufbt.isAdministrativePerson)
        .map(ufbt => ufbt.user),
      'lastName'
    )
  )
  fbt.set(
    'teachers',
    _.orderBy(
      fbt.userFeedbackTargets.filter(ufbt => ufbt.accessStatus === 'TEACHER').map(ufbt => ufbt.user),
      'lastName'
    )
  )
  fbt.set('tags', _.uniqBy((fbt.courseUnit?.tags ?? []).concat(fbt.courseRealisation?.tags ?? []), 'id'))
  populateGroupInformation(fbt)

  const surveys = await getFeedbackTargetSurveys(fbt)
  fbt.populateSurveys(surveys)
  const studentListVisible = await fbt.courseUnit.isStudentListVisible()
  const publicQuestionIds = fbt.getPublicQuestionIds(surveys)
  const publicityConfigurableQuestionIds = fbt.getPublicityConfigurableQuestionIds(surveys)
  const feedbackCanBeGiven = await fbt.feedbackCanBeGiven()

  const publicTarget = fbt.toPublicObject()

  const feedbackTargetJson = {
    ...publicTarget,
    studentListVisible,
    feedbackCanBeGiven,
    surveys,
    publicQuestionIds,
    publicityConfigurableQuestionIds,
  }

  return feedbackTargetJson
}

const getAdditionalDataFromCacheOrDb = async (id: number | string) => {
  let data = (await cache.get(id)) as Awaited<ReturnType<typeof getFromDb>> | null
  if (!data) {
    data = await getFromDb(id)
    cache.set(data.id, data)
  }
  return data
}

const getUserFeedbackTarget = (userId: string, feedbackTargetId: number | string) =>
  UserFeedbackTarget.findOne({
    where: { userId, feedbackTargetId },
    include: [{ model: Feedback, as: 'feedback' }],
  })

const getFeedbackTarget = (feedbackTargetId: number | string) =>
  FeedbackTarget.findByPk(feedbackTargetId, {
    attributes: {
      /* These we get from cache */ exclude: ['studentCount', 'publicQuestionIds'],
    },
    include: [{ model: CourseRealisation, as: 'courseRealisation' }],
  })

const getOneForUser = async (id: number, user: UserType) => {
  const [additionalData, userFeedbackTarget, feedbackTarget] = await Promise.all([
    getAdditionalDataFromCacheOrDb(id),
    getUserFeedbackTarget(user.id, id),
    getFeedbackTarget(id),
  ])

  if (!feedbackTarget) {
    throw new ApplicationError('Not found', 404)
  }

  const { accessStatus } = await getAccess({
    userFeedbackTarget,
    user,
    feedbackTarget,
  })

  if (accessStatus.includes('NONE')) {
    throw new ApplicationError('No access', 403)
  }

  return {
    ...additionalData,
    accessStatus,
    feedback: userFeedbackTarget?.feedback ?? null,
    groupIds: userFeedbackTarget?.groupIds ?? [],
    ...feedbackTarget.toJSON(),
  }
}

export { getOneForUser, getAdditionalDataFromCacheOrDb }
