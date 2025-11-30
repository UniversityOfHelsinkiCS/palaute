import { startOfDay, subDays } from 'date-fns'
import {
  Organisation,
  CourseUnit,
  CourseRealisation,
  FeedbackTarget,
  User,
  Feedback,
  UserFeedbackTarget,
  OrganisationFeedbackCorrespondent,
  CourseUnitsOrganisation,
  CourseRealisationsOrganisation,
} from '../models'
import { getUniversitySurvey } from '../services/surveys'
import { createTestObject } from './utils'
import { buildSummaries } from '../services/summary/buildSummaries'

const CURRENT_YEAR = new Date().getFullYear()

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
    data: universitySurvey.questions.map(({ id: questionId }) => ({ questionId, data: '5' })),
  }))

  return {
    TEST_ORG_ID,
    TEST_COURSE_UNIT_ID,
    TEST_COURSE_UNIT_GROUP_ID,
    TEST_COURSE_REALISATION_ID,
    TEST_STUDENTS,
    TEST_FEEDBACKS,
  }
}

export const initTestSummary = async ({ user }: { user: any }) => {
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
    userCreated: true,
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
    startDate: startOfDay(new Date(`${CURRENT_YEAR}-01-01`)),
    endDate: startOfDay(startOfDay(subDays(new Date(), 1))),
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
}
