const { uniqueId } = require('lodash')
const { Op } = require('sequelize')
const { startOfDay } = require('date-fns')
const {
  Organisation,
  CourseUnit,
  CourseRealisation,
  FeedbackTarget,
  User,
  Feedback,
  UserFeedbackTarget,
  Summary,
  OrganisationFeedbackCorrespondent,
  CourseUnitsOrganisation,
  CourseRealisationsOrganisation,
} = require('../../models')
const getUniversitySurvey = require('../surveys/universitySurvey')
const { createTestObject, clearTestObject } = require('./utils')
const { buildSummaries } = require('../summary/buildSummaries')

const getTestData = async () => {
  const TEST_ORG_ID = 'norppa-summary-test-org-1'
  const TEST_COURSE_UNIT_ID = 'norppa-test-course-unit-id-1'
  const TEST_COURSE_UNIT_GROUP_ID = 'norppa-test-course-unit-group-id-1'
  const TEST_COURSE_REALISATION_ID = 'norppa-test-course-unit-realisation-id-1'
  const TEST_STUDENTS = [
    {
      id: 'norppa-test-student-id-1',
      username: 'student-1',
    },
    {
      id: 'norppa-test-student-id-2',
      username: 'student-2',
    },
  ]
  const universitySurvey = await getUniversitySurvey()
  const TEST_FEEDBACKS = TEST_STUDENTS.map(({ id }) => ({
    userId: id,
    data: universitySurvey.questions.map(({ id }) => ({ questionId: id, data: '5' })),
  }))

  // console.log(JSON.stringify(TEST_FEEDBACKS, null, 2))

  return {
    TEST_ORG_ID,
    TEST_COURSE_UNIT_ID,
    TEST_COURSE_UNIT_GROUP_ID,
    TEST_COURSE_REALISATION_ID,
    TEST_STUDENTS,
    TEST_FEEDBACKS,
  }
}

const initTestSummary = async ({ user }) => {
  const testData = await getTestData()

  await createTestObject(User, { id: user.hyPersonSisuId, username: user.uid })

  const org = await createTestObject(Organisation, {
    id: testData.TEST_ORG_ID,
    name: {
      fi: 'Yhteenveto-organisaatio',
      en: 'Summary test organisation',
      sv: 'asdasdasd',
    },
    code: 'TEST_SUMMARY_ORG',
  })

  await createTestObject(OrganisationFeedbackCorrespondent, {
    organisationId: org.id,
    userId: user.hyPersonSisuId,
  })

  await createTestObject(CourseUnit, {
    id: testData.TEST_COURSE_UNIT_ID,
    groupId: testData.TEST_COURSE_UNIT_GROUP_ID,
    name: {
      fi: 'Yhteenveto-kurssi',
      en: 'Summary test course',
      sv: 'asdasdasd',
    },
    courseCode: 'SUMMARY_TEST_COURSE',
  })

  await createTestObject(CourseUnitsOrganisation, {
    courseUnitId: testData.TEST_COURSE_UNIT_ID,
    organisationId: org.id,
    type: 'primary',
  })

  await createTestObject(CourseRealisation, {
    id: testData.TEST_COURSE_REALISATION_ID,
    name: {
      fi: 'Yhteenveto-kurssin toteutus',
      en: 'Summary test course realisation',
      sv: 'asdasdasd',
    },
    startDate: startOfDay(new Date('2023-08-01')),
    endDate: startOfDay(new Date('2023-12-31')),
  })

  await createTestObject(CourseRealisationsOrganisation, {
    courseRealisationId: testData.TEST_COURSE_REALISATION_ID,
    organisationId: org.id,
    type: 'primary',
  })

  const fbt = await createTestObject(FeedbackTarget, {
    name: {
      fi: 'Yhteenveto-palautteen kohde',
      en: 'Summary test feedback target',
      sv: 'asdasdasd',
    },
    courseRealisationId: testData.TEST_COURSE_REALISATION_ID,
    courseUnitId: testData.TEST_COURSE_UNIT_ID,
    feedbackType: 'courseRealisation',
    typeId: testData.TEST_COURSE_REALISATION_ID,
    opensAt: startOfDay(new Date('2023-08-01')),
    closesAt: startOfDay(new Date('2023-12-31')),
    feedbackCount: 2,
    hidden: false,
  })

  await createTestObject(UserFeedbackTarget, {
    userId: user.hyPersonSisuId,
    feedbackTargetId: fbt.id,
    accessStatus: 'RESPONSIBLE_TEACHER',
  })

  for (const student of testData.TEST_STUDENTS) {
    await createTestObject(User, student)
  }

  for (const feedback of testData.TEST_FEEDBACKS) {
    const fb = await createTestObject(Feedback, feedback)
    await createTestObject(UserFeedbackTarget, {
      userId: feedback.userId,
      feedbackTargetId: fbt.id,
      feedbackId: fb.id,
      accessStatus: 'STUDENT',
    })
  }

  await buildSummaries()

  const summary = await Summary.findOne({
    where: {
      entityId: testData.TEST_COURSE_REALISATION_ID,
    },
  })

  console.log(summary.toJSON())
}

const clearTestSummary = async ({ user }) => {
  const testData = await getTestData()

  await clearTestObject(UserFeedbackTarget, {
    userId: user.hyPersonSisuId,
  })

  await clearTestObject(OrganisationFeedbackCorrespondent, {
    userId: user.hyPersonSisuId,
  })

  await clearTestObject(CourseUnitsOrganisation, {
    courseUnitId: testData.TEST_COURSE_UNIT_ID,
  })

  await clearTestObject(CourseRealisationsOrganisation, {
    courseRealisationId: testData.TEST_COURSE_REALISATION_ID,
  })

  for (const { userId } of testData.TEST_FEEDBACKS) {
    await clearTestObject(UserFeedbackTarget, {
      userId,
    })
    await clearTestObject(Feedback, {
      userId,
    })
  }

  await clearTestObject(FeedbackTarget, {
    [Op.or]: {
      courseRealisationId: testData.TEST_COURSE_REALISATION_ID,
      courseUnitId: testData.TEST_COURSE_UNIT_ID,
    },
  }).then(async () => {
    await clearTestObject(CourseRealisation, {
      id: testData.TEST_COURSE_REALISATION_ID,
    })

    await clearTestObject(CourseUnit, {
      id: testData.TEST_COURSE_UNIT_ID,
    })
  })

  await clearTestObject(Organisation, {
    code: testData.TEST_ORG_ID,
  })

  await clearTestObject(User, {
    id: user.hyPersonSisuId,
  })

  for (const { id } of testData.TEST_STUDENTS) {
    await clearTestObject(User, {
      id,
    })
  }
}

module.exports = {
  initTestSummary,
  clearTestSummary,
}
