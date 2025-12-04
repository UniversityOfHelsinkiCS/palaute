import { Response, Router } from 'express'
import { Op, QueryTypes } from 'sequelize'
import _ from 'lodash'

import {
  UserFeedbackTarget,
  FeedbackTarget,
  CourseRealisation,
  CourseUnit,
  Organisation,
  Tag,
  Summary,
} from '../../models'

import { sequelize } from '../../db/dbConnection'
import { INCLUDE_COURSES } from '../../util/config'
import { AuthenticatedRequest } from '../../types'

const getCourseUnitsForTeacher = async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req

  const now = new Date()

  const latestEndedCourseRealisationsRows = await sequelize.query<{ course_realisation_id: string }>(
    `
    SELECT DISTINCT ON (course_units.course_code)
      course_realisations.id AS course_realisation_id
    FROM user_feedback_targets
    INNER JOIN feedback_targets ON user_feedback_targets.feedback_target_id = feedback_targets.id
    INNER JOIN course_realisations ON feedback_targets.course_realisation_id = course_realisations.id
    INNER JOIN course_units ON feedback_targets.course_unit_id = course_units.id
    INNER JOIN course_units_organisations ON course_units_organisations.course_unit_id = course_units.id
    INNER JOIN organisations ON course_units_organisations.organisation_id = organisations.id
    WHERE
      user_feedback_targets.user_id = :userId AND
      is_teacher(user_feedback_targets.access_status) AND
      course_realisations.end_date < NOW() AND
      course_realisations.end_date > :courseRealisationEndDateAfter AND
      course_units_organisations.type = 'PRIMARY' AND
      NOT (course_units.course_code = ANY (organisations.disabled_course_codes))
    ORDER BY course_units.course_code, course_realisations.start_date DESC;
  `,
    {
      replacements: {
        userId: user.id,
        courseRealisationEndDateAfter: new Date(2021, 3, 1),
      },
      type: QueryTypes.SELECT,
    }
  )

  const latestEndedCourseRealisationIds = latestEndedCourseRealisationsRows.map(row => row.course_realisation_id)

  const userTargets = await UserFeedbackTarget.findAll({
    where: {
      userId: user.id,
      accessStatus: { [Op.in]: ['RESPONSIBLE_TEACHER', 'TEACHER'] },
    },
    attributes: ['id'],
    include: [
      {
        model: FeedbackTarget,
        as: 'feedbackTarget',
        required: true,
        attributes: [
          'id',
          'name',
          'opensAt',
          'closesAt',
          'feedbackResponseReminderEmailSent',
          [sequelize.literal('length(feedback_response) > 3'), 'feedbackResponseGiven'],
          'continuousFeedbackEnabled',
          'userCreated',
        ],
        where: {
          feedbackType: 'courseRealisation',
        },
        include: [
          {
            model: CourseRealisation,
            as: 'courseRealisation',
            required: true,
            attributes: ['id', 'name', 'startDate', 'endDate', 'userCreated'],
            where: {
              [Op.or]: [
                {
                  startDate: {
                    [Op.lte]: now,
                  },
                  endDate: {
                    [Op.gte]: now,
                  },
                },
                {
                  startDate: {
                    [Op.gt]: now,
                  },
                },
                {
                  id: {
                    [Op.in]: latestEndedCourseRealisationIds,
                  },
                },
              ],
            },
          },
          {
            model: Summary,
            required: false,
            as: 'summary',
          },
          {
            model: CourseUnit,
            as: 'courseUnit',
            required: true,
            attributes: ['id', 'name', 'courseCode', 'userCreated'],
            include: [
              {
                model: Organisation,
                as: 'organisations',
                required: true,
                attributes: ['disabledCourseCodes'],
              },
            ],
          },
        ],
      },
    ],
  })

  const targets = userTargets
    .filter(({ feedbackTarget }) => (feedbackTarget.userCreated ? feedbackTarget.courseRealisation.userCreated : true))
    .map(({ feedbackTarget }) => feedbackTarget)
    .filter(
      ({ courseUnit }) =>
        !courseUnit.organisations.some(({ disabledCourseCodes }) => disabledCourseCodes.includes(courseUnit.courseCode))
    )

  const courseUnitByCourseCode: Record<string, CourseUnit> = targets.reduce(
    (acc, { courseUnit }) => ({
      ...acc,
      [courseUnit.courseCode]: courseUnit,
    }),
    {}
  )

  const targetsByCourseCode = _.groupBy(targets, ({ courseUnit }) => courseUnit.courseCode)

  const targetFields = ['id', 'name', 'opensAt', 'closesAt', 'continuousFeedbackEnabled', 'userCreated']
  const courseUnits = Object.entries(targetsByCourseCode).map(([courseCode, unfilteredTargets]) => {
    const targets = unfilteredTargets.filter(
      target =>
        target.courseRealisation.startDate >= new Date(2021, 8, 1) ||
        (target.courseRealisation.startDate >= new Date(2021, 7, 15) &&
          target.courseRealisation.endDate >= new Date(2021, 9, 1)) ||
        INCLUDE_COURSES.includes(target.courseRealisation.id)
    )
    const courseUnit = _.pick(courseUnitByCourseCode[courseCode].toJSON(), ['courseCode', 'name', 'userCreated'])

    const ongoingTargets = targets.filter(
      ({ courseRealisation }) => courseRealisation.startDate <= new Date() && courseRealisation.endDate >= new Date()
    )

    const feedbackOpenOngoingTarget = ongoingTargets.find(target => target.isOpen())

    const ongoingTarget =
      feedbackOpenOngoingTarget ?? _.maxBy(ongoingTargets, ({ courseRealisation }) => courseRealisation.startDate)

    const upcomingTarget = _.minBy(
      targets.filter(({ courseRealisation }) => courseRealisation.startDate > new Date()),
      ({ courseRealisation }) => courseRealisation.startDate
    )

    const endedTarget = _.maxBy(
      targets.filter(({ courseRealisation }) => courseRealisation.endDate < new Date()),
      ({ courseRealisation }) => courseRealisation.startDate
    )

    const makeTargetObject = (feedbackTarget: FeedbackTarget) =>
      feedbackTarget
        ? {
            ...feedbackTarget.courseRealisation.toJSON(),
            feedbackResponseGiven: feedbackTarget.feedbackResponseGiven(),
            feedbackResponseSent: feedbackTarget.feedbackResponseEmailSent,
            feedbackCount: feedbackTarget.summary?.data.feedbackCount ?? 0,
            studentCount: feedbackTarget.summary?.data.studentCount ?? 0,
            feedbackTarget: _.pick(feedbackTarget, targetFields),
          }
        : null

    return {
      ...courseUnit,
      ongoingCourseRealisation: makeTargetObject(ongoingTarget),
      upcomingCourseRealisation: makeTargetObject(upcomingTarget),
      endedCourseRealisation: makeTargetObject(endedTarget),
    }
  })

  res.send(courseUnits)
}

const getCourseUnitsByOrganisation = async (req: AuthenticatedRequest, res: Response) => {
  const { code } = req.params

  const courseUnits = await CourseUnit.findAll({
    where: {
      courseCode: {
        [Op.notLike]: 'AY%',
      },
      '$organisations.CourseUnitsOrganisation.type$': 'PRIMARY',
    },
    include: [
      {
        model: Organisation,
        attributes: [],
        required: true,
        as: 'organisations',
        where: {
          code,
        },
      },
      {
        model: Tag,
        as: 'tags',
        attributes: ['id', 'name', 'hash'],
        through: { attributes: [] },
      },
    ],
  })

  // First sort by validity period start date. This ensures that when taking the uniq, the most recent CUs are preserved
  const uniqueCourseUnits = _.uniqBy(
    _.orderBy(courseUnits, cu => cu.validityPeriod?.startDate, 'desc'),
    'courseCode'
  )

  const sortedCourseUnits = _.sortBy(uniqueCourseUnits, 'courseCode')

  res.send(sortedCourseUnits)
}

export const router = Router()

router.get('/responsible', getCourseUnitsForTeacher)
router.get('/for-organisation/:code', getCourseUnitsByOrganisation)
