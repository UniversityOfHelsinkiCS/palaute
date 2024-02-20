const { startOfDay } = require('date-fns')
const {
  FeedbackTarget,
  CourseRealisation,
  CourseUnit,
  UserFeedbackTarget,
  Organisation,
  CourseRealisationsOrganisation,
  CourseUnitsOrganisation,
} = require('../models')
const { createTestObject } = require('./utils')
const {
  TEST_ORGANISATION_ID,
  TEST_COURSE_UNIT_ID,
  TEST_COURSE_REALISATION_ID,
  TEST_ORGANISATION_CODE,
} = require('./testIds')

const seedFeedbackTargetsForTeacher = async ({ teacher, student, opensAt, closesAt }) => {
  await createTestObject(Organisation, {
    id: TEST_ORGANISATION_ID,
    name: {
      fi: 'Testiorganisaatio',
      en: 'Test organisation',
      sv: 'asdasdasd',
    },
    code: TEST_ORGANISATION_CODE,
  })

  await createTestObject(CourseUnit, {
    id: TEST_COURSE_UNIT_ID,
    name: {
      fi: 'Testauskurssi',
      en: 'Testauskurssi',
      sv: 'asdasdasd',
    },
    courseCode: 'SUMMARY_TEST_COURSE',
  })

  await createTestObject(CourseUnitsOrganisation, {
    courseUnitId: TEST_COURSE_UNIT_ID,
    organisationId: TEST_ORGANISATION_ID,
    type: 'PRIMARY',
  })

  await createTestObject(CourseRealisation, {
    id: TEST_COURSE_REALISATION_ID,
    name: {
      fi: 'Testauskurssin toteutus',
      en: 'Test course realisation',
      sv: 'asdasdasd',
    },
    startDate: startOfDay(new Date('2023-08-01')),
    endDate: startOfDay(new Date('2023-12-31')),
  })

  await createTestObject(CourseRealisationsOrganisation, {
    courseRealisationId: TEST_COURSE_REALISATION_ID,
    organisationId: TEST_ORGANISATION_ID,
    type: 'PRIMARY',
  })

  const fbt = await createTestObject(FeedbackTarget, {
    name: {
      fi: 'Palautekohde',
      en: 'Test feedback target',
      sv: 'asdasdasd',
    },
    courseRealisationId: TEST_COURSE_REALISATION_ID,
    courseUnitId: TEST_COURSE_UNIT_ID,
    feedbackType: 'courseRealisation',
    typeId: TEST_COURSE_REALISATION_ID,
    opensAt: new Date(opensAt),
    closesAt: new Date(closesAt),
    feedbackCount: 0,
    hidden: false,
  })

  await createTestObject(UserFeedbackTarget, {
    userId: teacher.id,
    feedbackTargetId: fbt.id,
    accessStatus: 'RESPONSIBLE_TEACHER',
  })

  await createTestObject(UserFeedbackTarget, {
    userId: student.id,
    feedbackTargetId: fbt.id,
    accessStatus: 'STUDENT',
  })

  return [fbt]
}

module.exports = {
  seedFeedbackTargetsForTeacher,
}
