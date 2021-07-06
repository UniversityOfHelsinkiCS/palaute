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
  try {
    const nonOpenCourse = await CourseUnit.findOne({
      where: {
        courseCode: course.code.substring(2),
      },
    })
    if (nonOpenCourse) return nonOpenCourse
    const regex = course.code.match('[0-9.]+')
    if (!regex) {
      logger.info('CODE WITH NO MATCH', { code: course.code })
      return null
    }
    const charCode = course.code.substring(2, regex.index)
    const sameOrg = await CourseUnit.findOne({
      where: {
        courseCode: {
          [Op.iLike]: `${charCode}%`,
        },
      },
    })
    return sameOrg
  } catch (_) {
    logger.info('ERR', course)
    return null
  }
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

  const openUniCourses = courseUnits.filter(({ code }) => code.startsWith('AY'))
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
        logger.info('OLD COURSE UNIT', { oldCourseUnit: nonOpenCourse })
        openCourseUnitsOrganisations.push({
          type: 'PRIMARY',
          courseUnitId: course.id,
          organisationId: course.organisations[0].organisationId,
        })
      } else {
        openCourseUnitsOrganisations.push({
          type: 'PRIMARY',
          courseUnitId: course.id,
          organisationId: orgId.organisationId,
        })
      }
    } else {
      // Acual open course?
      logger.info('Open course', { course })
      openCourseUnitsOrganisations.push({
        type: 'PRIMARY',
        courseUnitId: course.id,
        organisationId: course.organisations[0].organisationId,
      })
    }
  }, Promise.resolve())

  await CourseUnitsOrganisation.bulkCreate(openCourseUnitsOrganisations, {
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

  await createCourseRealisations(filteredCourses)

  await createFeedbackTargets(filteredCourses)
}

const courseUnitHandler = async (courseRealisations) => {
  await createCourseUnits(
    []
      .concat(...courseRealisations.map((course) => course.courseUnits))
      .filter(({ code }) => !code.startsWith('AY')),
  )
}

const openCourseUnitHandler = async (courseRealisations) => {
  await createCourseUnits(
    []
      .concat(...courseRealisations.map((course) => course.courseUnits))
      .filter(({ code }) => code.startsWith('AY')),
  )
}

const updateCoursesAndTeacherFeedbackTargets = async () => {
  // This will become absolute mayhem because of open uni.
  // What we have to do
  // 1. Go through all non-open course_units
  // 2. Go through all open course_units
  // 3. Go through all course_units and only then create realisations.
  await mangleData(
    'course_unit_realisations_with_course_units',
    1000,
    courseUnitHandler,
  )
  await mangleData(
    'course_unit_realisations_with_course_units',
    1000,
    openCourseUnitHandler,
  )
  await mangleData(
    'course_unit_realisations_with_course_units',
    1000,
    coursesHandler,
  )
}

module.exports = updateCoursesAndTeacherFeedbackTargets
