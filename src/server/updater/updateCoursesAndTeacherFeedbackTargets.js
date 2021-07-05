const dateFns = require('date-fns')

const { Op } = require('sequelize')
const {
  CourseUnit,
  CourseUnitsOrganisation,
  CourseRealisation,
  FeedbackTarget,
  UserFeedbackTarget,
} = require('../models')
// eslint-disable-next-line no-unused-vars
const logger = require('../util/logger')
const mangleData = require('./updateLooper')

const validRealisationTypes = [
  'urn:code:course-unit-realisation-type:teaching-participation-lab',
  'urn:code:course-unit-realisation-type:teaching-participation-online',
  'urn:code:course-unit-realisation-type:teaching-participation-field-course',
  'urn:code:course-unit-realisation-type:teaching-participation-project',
  'urn:code:course-unit-realisation-type:teaching-participation-lectures',
  'urn:code:course-unit-realisation-type:teaching-participation-small-group',
  'urn:code:course-unit-realisation-type:teaching-participation-seminar',
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

// eslint-disable-next-line no-unused-vars
const findMatchingCourseUnit = async (course) => {
  const nonOpenCourse = await CourseUnit.findOne({
    where: {
      courseCode: course.code.substring(2),
    },
  })
  if (nonOpenCourse) return nonOpenCourse
  const charCode = course.code.substring(2, course.code.match('[0-9.]+').index)
  const sameOrg = await CourseUnit.findOne({
    where: {
      courseCode: {
        [Op.iLike]: `${charCode}%`,
      },
    },
  })
  return sameOrg
}

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

  const courseUnitsOrganisations = [].concat(
    ...courseUnits
      .filter(({ code }) => !code.startsWith('AY'))
      .map(({ id: courseUnitId, organisations }) =>
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

  /* const openUniCourses = courseUnits.filter(({ code }) => code.startsWith('AY'))
  const openCourseUnitsOrganisations = []
  await openUniCourses.reduce(async (p, course) => {
    await p
    // try to find organisation for open uni course.
    // 1st option find by course code without AY part.
    // 2nd option find by course code without text part.
    // 3rd option if not found then course is probably open uni course.
    const nonOpenCourse = await findMatchingCourseUnit(course)
    if (nonOpenCourse) {
      const orgId = await CourseUnitsOrganisation.findOne({
        where: {
          courseUnitId: nonOpenCourse.id,
          type: 'PRIMARY',
        },
      })
      if (!orgId) {
        console.log(nonOpenCourse, orgId)
      }
      openCourseUnitsOrganisations.push({
        type: 'PRIMARY',
        courseUnitId: course.id,
        organisationId: orgId.organisationId,
      })
    } else {
      // Acual open course?
      logger.info('Open course', { course })
      openCourseUnitsOrganisations.push({
        type: 'PRIMARY',
        courseUnitId: course.id,
        organisationId: course.organisations[0].id,
      })
    }
  }, Promise.resolve())

  await CourseUnitsOrganisation.bulkCreate(openCourseUnitsOrganisations, {
    ignoreDuplicates: true,
  }) */
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
