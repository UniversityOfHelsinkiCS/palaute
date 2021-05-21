const dateFns = require('date-fns')

const {
  CourseUnit,
  CourseUnitsOrganisation,
  CourseRealisation,
  FeedbackTarget,
  UserFeedbackTarget,
} = require('../models')
const logger = require('../util/logger')
const mangleData = require('./updateLooper')

const validRealisationTypes = [
  'urn:code:course-unit-realisation-type:teaching-participation-lab',
  'urn:code:course-unit-realisation-type:teaching-participation-online',
  'urn:code:course-unit-realisation-type:teaching-participation-field-course',
  'urn:code:course-unit-realisation-type:teaching-participation-project',
  'urn:code:course-unit-realisation-type:teaching-participation-lectures',
  'urn:code:course-unit-realisation-type:teaching-participation-small-group',
]

const formatDate = (date) => dateFns.format(date, 'yyyy-MM-dd')

const commonFeedbackName = {
  fi: 'Yleinen palaute kurssista',
  en: 'General feedback about the course',
  sv: 'Allmän respons om kursen',
}

const combineStudyGroupName = (firstPart, secondPart) => ({
  fi:
    firstPart.fi && secondPart.fi ? `${firstPart.fi}: ${secondPart.fi}` : null,
  en:
    firstPart.en && secondPart.en ? `${firstPart.en}: ${secondPart.en}` : null,
  sv:
    firstPart.sv && secondPart.sv ? `${firstPart.sv}: ${secondPart.sv}` : null,
})

const createCourseUnit = async ({
  id,
  name,
  code,
  validityPeriod,
  organisations,
}) => {
  const sortedOrganisationIds = organisations
    .sort((a, b) => a.share - b.share)
    .map((org) => org.organisationId)
  await CourseUnit.upsert({
    id,
    name,
    courseCode: code,
    validityPeriod,
  })
  const primaryId = sortedOrganisationIds.shift()
  await CourseUnitsOrganisation.findOrCreate({
    where: {
      type: 'PRIMARY',
      courseUnitId: id,
      organisationId: primaryId,
    },
    defaults: {
      type: 'PRIMARY',
      courseUnitId: id,
      organisationId: primaryId,
    },
  })
  await sortedOrganisationIds.reduce(async (promise, organisationId) => {
    await promise
    await CourseUnitsOrganisation.findOrCreate({
      where: {
        type: 'DIRECT',
        courseUnitId: id,
        organisationId,
      },
      defaults: {
        type: 'DIRECT',
        courseUnitId: id,
        organisationId,
      },
    })
  }, Promise.resolve())
}

const createCourseRealisation = async ({ id, name, activityPeriod }) => {
  await CourseRealisation.upsert({
    id,
    name,
    endDate: activityPeriod.endDate,
    startDate: activityPeriod.startDate,
  })
}

const createFeedbackTarget = async (
  feedbackType,
  typeId,
  courseUnitId,
  courseRealisationId,
  name,
  endDateString,
) => {
  const hidden = feedbackType !== 'courseRealisation'
  const feedbackTargetName =
    feedbackType === 'courseRealisation' ? commonFeedbackName : name
  // eslint-disable-next-line no-unused-vars
  const endDate = dateFns.parse(endDateString, 'yyyy-MM-dd', new Date())
  const opensAt = formatDate(new Date(2019, 0, 1))
  const closesAt = formatDate(new Date(2019, 0, 1))
  const [feedbackTarget] = await FeedbackTarget.findOrCreate({
    where: {
      feedbackType,
      typeId,
    },
    defaults: {
      feedbackType,
      typeId,
      courseUnitId,
      courseRealisationId,
      name: feedbackTargetName,
      hidden,
      opensAt,
      closesAt,
    },
  })
  return feedbackTarget.id
}

const courseRealisationHandler = async (course) => {
  const courseUnit = course.courseUnits[0] // TODO fix
  const personIds = course.responsibilityInfos
    .filter((data) => data.personId)
    .map((data) => data.personId)
  if (
    !courseUnit ||
    !validRealisationTypes.includes(course.courseUnitRealisationTypeUrn)
  )
    return []
  await createCourseUnit(courseUnit)
  await createCourseRealisation(course)
  const feedbackTargetIds = []
  feedbackTargetIds.push(
    await createFeedbackTarget(
      'courseRealisation',
      course.id,
      courseUnit.id,
      course.id,
      course.name,
      course.activityPeriod.endDate,
    ),
  )

  await course.studyGroupSets.reduce(async (promise, set) => {
    await promise
    await set.studySubGroups.reduce(async (p, group) => {
      await p
      feedbackTargetIds.push(
        await createFeedbackTarget(
          'studySubGroup',
          group.id,
          courseUnit.id,
          course.id,
          combineStudyGroupName(set.name, group.name),
          course.activityPeriod.endDate,
        ),
      )
    }, Promise.resolve())
  }, Promise.resolve())

  const userFeedbackTargets = []

  feedbackTargetIds.forEach((feedbackTargetId) => {
    personIds.forEach((userId) => {
      userFeedbackTargets.push({
        feedbackTargetId,
        userId,
        accessStatus: 'TEACHER',
      })
    })
  })

  return userFeedbackTargets
}

const coursesHandler = async (courses) => {
  let userFeedbackTargets = []
  await courses.reduce(async (promise, course) => {
    await promise
    try {
      userFeedbackTargets = userFeedbackTargets.concat(
        await courseRealisationHandler(course),
      )
    } catch (err) {
      logger.info('ERR', { err, course })
    }
  }, Promise.resolve())

  await UserFeedbackTarget.bulkCreate(userFeedbackTargets, {
    ignoreDuplicates: true,
  })
}

const updateCoursesAndTeacherFeedbackTargets = async () => {
  await mangleData(
    'course_unit_realisations_with_course_units',
    500,
    coursesHandler,
  )
}

module.exports = updateCoursesAndTeacherFeedbackTargets
