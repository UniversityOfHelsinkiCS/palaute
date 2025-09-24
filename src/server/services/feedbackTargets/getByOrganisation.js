const _ = require('lodash')
const { compareAsc, subDays, getDate, addMonths, getYear } = require('date-fns')
const { Op } = require('sequelize')
const {
  FeedbackTarget,
  CourseRealisation,
  Organisation,
  Tag,
  CourseUnit,
  UserFeedbackTarget,
  User,
} = require('../../models')
const { ApplicationError } = require('../../util/customErrors')

const getYearGrouped = feedbackTargets => {
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

const getPublicByOrganisation = async ({ organisationCode, startDate, endDate }) => {
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
              code: organisationCode,
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
              code: organisationCode,
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

  const feedbackTargetsWithUniqueCurs = _.uniqBy(feedbackTargets, fbt => fbt.dataValues.courseRealisation.id)
  const fbtsWithStartDate = feedbackTargetsWithUniqueCurs.map(fbt => {
    const fbtJson = fbt.toJSON()
    fbtJson.startDate = fbt.courseRealisation.startDate
    return fbtJson
  })

  return getYearGrouped(fbtsWithStartDate)
}

const getByOrganisation = async ({ organisationCode, startDate, endDate, user }) => {
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
          },
          endDate: {
            [Op.lte]: end,
          },
        },
      },
      {
        model: CourseUnit,
        as: 'courseUnit',
        attributes: ['id', 'name', 'courseCode'],
        include: {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'hash'],
          through: { attributes: [] },
        },
      },
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        attributes: ['accessStatus'],
        required: false,
        include: {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      },
    ],
  })

  const feedbackTargetsWithUniqueCurs = _.uniqBy(feedbackTargets, fbt => fbt.dataValues.courseRealisation.id)

  const feedbackTargetsWithStudentCounts = feedbackTargetsWithUniqueCurs
    .map(fbt => {
      const fbtJson = fbt.toJSON()

      fbtJson.tags = _.uniqBy(
        fbt.courseRealisation.tags
          .map(t => ({ ...t.toJSON(), from: 'courseRealisation' }))
          .concat(fbt.courseUnit.tags.map(t => ({ ...t.toJSON(), from: 'courseUnit' }))),
        'id'
      )
      delete fbtJson.courseRealisation.tags
      delete fbtJson.courseUnit.tags

      return fbtJson
    })
    .map(fbt => {
      const studentCount = _.sumBy(fbt.userFeedbackTargets, ufbt => (ufbt.accessStatus === 'STUDENT' ? 1 : 0))
      const teachers = fbt.userFeedbackTargets
        .filter(ufbt => ufbt.accessStatus === 'RESPONSIBLE_TEACHER' || ufbt.accessStatus === 'TEACHER')
        .map(ufbt => ufbt.user)

      delete fbt.userFeedbackTargets
      return {
        ...fbt,
        startDate: fbt.courseRealisation.startDate,
        studentCount,
        teachers,
      }
    })

  return getYearGrouped(feedbackTargetsWithStudentCounts)
}

module.exports = {
  getByOrganisation,
  getPublicByOrganisation,
}
