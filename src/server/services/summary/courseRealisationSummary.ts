import _ from 'lodash'

import { UserFeedbackTarget, User, CourseRealisation, CourseUnit, FeedbackTarget, Summary } from '../../models'
import languages from '../../util/languages.json'

const getCourseRealisationSummaryEntities = async (courseCode: string) => {
  const courseRealisations = await CourseRealisation.findAll({
    include: [
      {
        model: FeedbackTarget,
        as: 'feedbackTargets',
        attributes: ['id', 'closesAt', 'feedbackResponse'],
        where: {
          userCreated: false,
        },
        required: true,
        include: [
          {
            model: CourseUnit,
            as: 'courseUnit',
            where: { courseCode },
            attributes: ['id'],
            required: true,
          },
          {
            model: UserFeedbackTarget.scope('teachers'),
            as: 'userFeedbackTargets',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email'],
              },
            ],
          },
        ],
      },
      {
        model: Summary,
        as: 'summary',
      },
    ],
  })

  return courseRealisations
}

interface GetCourseRealisationSummariesParams {
  courseCode: string
  accessibleCourseRealisationIds: string[]
  organisationAccess: boolean
}

export const getCourseRealisationSummaries = async ({
  courseCode,
  accessibleCourseRealisationIds,
  organisationAccess,
}: GetCourseRealisationSummariesParams) => {
  const allCuSummaries = await getCourseRealisationSummaryEntities(courseCode)

  const courseRealisations = organisationAccess
    ? allCuSummaries
    : allCuSummaries.filter(cur => accessibleCourseRealisationIds.includes(cur.id))

  const results = courseRealisations.map(cur => {
    const allTeachers = cur.feedbackTargets[0].userFeedbackTargets

    const teachers = _.sortBy(
      allTeachers.filter(ufbt => ufbt.accessStatus === 'TEACHER').map(teacher => teacher.user),
      'lastName'
    )
    const responsibleTeachers = _.sortBy(
      allTeachers
        .filter(ufbt => ufbt.accessStatus === 'RESPONSIBLE_TEACHER' && !ufbt.isAdministrativePerson)
        .map(teacher => teacher.user),
      'lastName'
    )
    const administrativePersons = _.sortBy(
      allTeachers.filter(ufbt => ufbt.isAdministrativePerson).map(teacher => teacher.user),
      'lastName'
    )

    const teachingLanguages = (cur.teachingLanguages || []).map(lang => languages[lang]?.name)

    return {
      ...cur.toJSON(),
      courseCode,
      teachingLanguages,
      teachers,
      responsibleTeachers,
      administrativePersons,
    }
  })

  const orderedResults = _.orderBy(results, ['startDate', cur => cur.summary?.data?.feedbackCount], ['desc', 'desc'])

  return orderedResults
}
