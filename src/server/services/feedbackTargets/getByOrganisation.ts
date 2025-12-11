import _ from 'lodash'
import { compareAsc, subDays, getDate, addMonths, getYear } from 'date-fns'
import { InferAttributes, Op } from 'sequelize'
import {
  FeedbackTarget,
  CourseRealisation,
  Organisation,
  Tag,
  CourseUnit,
  UserFeedbackTarget,
  User,
} from '../../models'
import { ApplicationError } from '../../util/ApplicationError'

const getYearGrouped = (feedbackTargets: any[]) => {
  const dateGrouped = Object.entries(_.groupBy(feedbackTargets, fbt => fbt.startDate)).sort(([a], [b]) =>
    compareAsc(Date.parse(a), Date.parse(b))
  )

  const monthGrouped = Object.entries(
    _.groupBy(dateGrouped, ([date]) => {
      const d = Date.parse(date)
      return subDays(d, getDate(d) - 1) // first day of month
    })
  ).sort(([a], [b]) => compareAsc(Date.parse(a), Date.parse(b)))

  return Object.entries(_.groupBy(monthGrouped, ([date]) => getYear(Date.parse(date)))).sort(([a], [b]) =>
    a.localeCompare(b)
  )
}

interface GetPublicByOrganisationParams {
  organisationCodes: string[]
  startDate?: string | Date
  endDate?: string | Date
}

const getPublicByOrganisation = async ({ organisationCodes, startDate, endDate }: GetPublicByOrganisationParams) => {
  const start = startDate ? new Date(startDate) : new Date()
  const end = endDate ? new Date(endDate) : addMonths(start, 12)

  const feedbackTargetsThroughCourseRealisationsOrganisations = FeedbackTarget.findAll({
    attributes: ['id', 'name', 'opensAt', 'closesAt'],
    include: [
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        attributes: ['id', 'name', 'startDate', 'endDate', 'isMoocCourse', 'teachingLanguages'],
        required: true,
        include: [
          {
            model: Organisation,
            as: 'organisations',
            attributes: [],
            required: true,
            where: {
              code: {
                [Op.in]: organisationCodes,
              },
            },
          },
        ],
        where: {
          startDate: {
            [Op.gte]: start,
            [Op.lte]: end,
          },
        },
      },
      {
        model: CourseUnit,
        as: 'courseUnit',
        attributes: ['id', 'name', 'courseCode'],
      },
    ],
    where: {
      userCreated: false,
    },
  })

  const feedbackTargetsThroughCourseUnitsOrganisations = await FeedbackTarget.findAll({
    attributes: ['id', 'name', 'opensAt', 'closesAt'],
    include: [
      {
        model: CourseUnit,
        as: 'courseUnit',
        attributes: ['id', 'name', 'courseCode'],
        required: true,
        include: [
          {
            model: Organisation,
            as: 'organisations',
            attributes: [],
            required: true,
            where: {
              code: {
                [Op.in]: organisationCodes,
              },
            },
          },
        ],
      },
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        attributes: ['id', 'name', 'startDate', 'endDate', 'isMoocCourse', 'teachingLanguages'],
        required: true,
        where: {
          startDate: {
            [Op.gte]: start,
            [Op.lte]: end,
          },
        },
      },
    ],
    where: {
      userCreated: false,
    },
  })

  const feedbackTargets = (await feedbackTargetsThroughCourseRealisationsOrganisations).concat(
    feedbackTargetsThroughCourseUnitsOrganisations
  )

  const feedbackTargetsWithUniqueCurs = _.uniqBy(feedbackTargets, fbt => fbt.courseRealisation.id)
  const fbtsWithStartDate = feedbackTargetsWithUniqueCurs.map(fbt => {
    const fbtJson = fbt.toJSON() as InferAttributes<FeedbackTarget> & { startDate?: Date }
    fbtJson.startDate = fbt.courseRealisation.startDate
    return fbtJson
  })

  return getYearGrouped(fbtsWithStartDate)
}

interface GetByOrganisationParams {
  organisationCode: string
  startDate?: string | Date
  endDate?: string | Date
  user: User
}

const getByOrganisation = async ({ organisationCode, startDate, endDate, user }: GetByOrganisationParams) => {
  const organisationAccess = await user.organisationAccess

  if (!organisationAccess[organisationCode]?.read) ApplicationError.Forbidden()

  const start = startDate ? new Date(startDate) : new Date()
  const end = endDate ? new Date(endDate) : addMonths(start, 12)

  const feedbackTargets = await FeedbackTarget.findAll({
    attributes: ['id', 'name', 'opensAt', 'closesAt', 'feedbackResponseEmailSent'],
    include: [
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        attributes: ['id', 'name', 'startDate', 'endDate', 'isMoocCourse', 'teachingLanguages'],
        required: true,
        include: [
          {
            model: Organisation,
            as: 'organisations',
            attributes: [],
            required: true,
            where: {
              code: organisationCode,
            },
          },
          {
            model: Tag,
            as: 'tags',
            attributes: ['id', 'name', 'hash'],
            through: { attributes: [] },
          },
        ],
        where: {
          startDate: {
            [Op.gte]: start,
            [Op.lte]: end,
          },
        },
      },
      {
        model: CourseUnit,
        as: 'courseUnit',
        attributes: ['id', 'name', 'courseCode'],
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
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        attributes: ['accessStatus'],
        required: false,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
      },
    ],
  })

  const feedbackTargetsWithUniqueCurs = _.uniqBy(feedbackTargets, fbt => fbt.dataValues.id)

  const feedbackTargetsWithStudentCounts = feedbackTargetsWithUniqueCurs
    .map(fbt => {
      const fbtJson = fbt.toJSON() as InferAttributes<FeedbackTarget, { omit: 'tags' }> & { tags?: any[] }

      fbtJson.tags = _.uniqBy(
        fbt.courseRealisation.tags
          .map(t => ({ ...t.toJSON(), from: 'courseRealisation' }))
          .concat(fbt.courseUnit.tags.map((t: any) => ({ ...t.toJSON(), from: 'courseUnit' }))),
        'id'
      )
      delete fbtJson.courseRealisation.tags
      delete fbtJson.courseUnit.tags

      return fbtJson
    })
    .map(fbt => {
      const studentCount = _.sumBy((fbt as any).userFeedbackTargets, (ufbt: any) =>
        ufbt.accessStatus === 'STUDENT' ? 1 : 0
      )
      const teachers = (fbt as any).userFeedbackTargets
        .filter((ufbt: any) => ufbt.accessStatus === 'RESPONSIBLE_TEACHER' || ufbt.accessStatus === 'TEACHER')
        .map((ufbt: any) => ufbt.user)

      delete fbt.userFeedbackTargets
      return {
        ...fbt,
        startDate: (fbt as any).courseRealisation.startDate,
        studentCount,
        teachers,
      }
    })

  return getYearGrouped(feedbackTargetsWithStudentCounts)
}

export { getByOrganisation, getPublicByOrganisation }
