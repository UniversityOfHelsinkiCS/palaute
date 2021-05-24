const dateFns = require('date-fns')

const {
  CourseUnit,
  CourseUnitsOrganisation,
  CourseRealisation,
  FeedbackTarget,
  UserFeedbackTarget,
} = require('../models')
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

const createCourseUnits = async (courseUnits) => {
  const ids = new Set()
  const filteredCourseUnits = courseUnits
    .filter((cu) => {
      if (ids.has(cu.id)) return false

      ids.add(cu.id)
      return true
    })
    .map(({ id, name, code, validityPeriod }) => ({
      id,
      name,
      courseCode: code,
      validityPeriod,
    }))

  await CourseUnit.bulkCreate(filteredCourseUnits, {
    updateOnDuplicate: ['name', 'courseCode', 'validityPeriod'],
  })

  // Leo fix constraint
  const courseUnitsOrganisations = [].concat(
    ...courseUnits.map(({ id: courseUnitId, organisations }) =>
      organisations
        .sort((a, b) => b.share - a.share)
        .map(({ organisationId }, index) => ({
          type: index === 0 ? 'PRIMARY' : 'DIRECT',
          courseUnitId,
          organisationId,
        })),
    ),
  )

  await CourseUnitsOrganisation.bulkCreate(courseUnitsOrganisations, {
    ignoreDuplicates: true,
  })
}

const createCourseRealisations = async (courseRealisations) => {
  await CourseRealisation.bulkCreate(
    courseRealisations.map(({ id, name, activityPeriod }) => ({
      id,
      name,
      endDate: activityPeriod.endDate,
      startDate: activityPeriod.startDate,
    })),
    { updateOnDuplicate: ['name', 'endDate', 'startDate'] },
  )
}

const createFeedbackTargets = async (courses) => {
  const opensAt = formatDate(new Date(2019, 0, 1))
  const closesAt = formatDate(new Date(2019, 0, 1))

  const courseIdToPersonIds = {}

  const feedbackTargets = [].concat(
    ...courses.map((course) => {
      courseIdToPersonIds[course.id] = course.responsibilityInfos
        .filter(({ personId }) => personId)
        .map(({ personId }) => personId)

      const courseUnit = course.courseUnits[0] // TODO fix
      const targets = [
        {
          feedbackType: 'courseRealisation',
          typeId: course.id,
          courseUnitId: courseUnit.id,
          courseRealisationId: course.id,
          name: commonFeedbackName,
          hidden: false,
          opensAt,
          closesAt,
        },
      ]
      course.studyGroupSets.forEach((studyGroupSet) =>
        studyGroupSet.studySubGroups.forEach((subGroup) => {
          targets.push({
            feedbackType: 'studySubGroup',
            typeId: subGroup.id,
            courseUnitId: courseUnit.id,
            courseRealisationId: course.id,
            name: combineStudyGroupName(studyGroupSet.name, subGroup.name),
            hidden: true,
            opensAt,
            closesAt,
          })
        }),
      )
      return targets
    }),
  )

  const feedbackTargetsWithIds = await FeedbackTarget.bulkCreate(
    feedbackTargets,
    {
      updateOnDuplicate: ['feedbackType', 'typeId'],
      returning: ['id'],
    },
  )

  const userFeedbackTargets = [].concat(
    ...feedbackTargetsWithIds.map(
      ({ id: feedbackTargetId, courseRealisationId }) =>
        courseIdToPersonIds[courseRealisationId].map((userId) => ({
          feedbackTargetId,
          userId,
          accessStatus: 'TEACHER',
        })),
    ),
  )

  await UserFeedbackTarget.bulkCreate(userFeedbackTargets, {
    ignoreDuplicates: true, // TODO: is this broken?
  })
}

const coursesHandler = async (courses) => {
  const filteredCourses = courses.filter(
    (course) =>
      course.courseUnits.length &&
      validRealisationTypes.includes(course.courseUnitRealisationTypeUrn),
  )

  await createCourseUnits(
    filteredCourses.map((course) => course.courseUnits[0]),
  ) // TODO: fix

  await createCourseRealisations(filteredCourses)

  await createFeedbackTargets(filteredCourses)
}

const updateCoursesAndTeacherFeedbackTargets = async () => {
  await mangleData(
    'course_unit_realisations_with_course_units',
    1000,
    coursesHandler,
  )
}

module.exports = updateCoursesAndTeacherFeedbackTargets
