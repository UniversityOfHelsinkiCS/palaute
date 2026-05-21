import { startOfDay } from 'date-fns'
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
  Survey,
  Question,
} from '../models'
import { getUniversitySurvey } from '../services/surveys'
import { createTestObject } from './utils'
import { buildSummaries } from '../services/summary/buildSummaries'

const IDS = {
  ORG: 'norppa-versioned-summary-org-1',
  COURSE_UNIT: 'norppa-versioned-summary-cu-1',
  COURSE_UNIT_GROUP: 'norppa-versioned-summary-cug-1',
  CUR_OLD: 'norppa-versioned-summary-cur-old-1',
  CUR_NEW: 'norppa-versioned-summary-cur-new-1',
  STUDENTS_OLD: [
    { id: 'norppa-versioned-summary-student-old-1', username: 'versioned-student-old-1' },
    { id: 'norppa-versioned-summary-student-old-2', username: 'versioned-student-old-2' },
  ],
  STUDENTS_NEW: [
    { id: 'norppa-versioned-summary-student-new-1', username: 'versioned-student-new-1' },
    { id: 'norppa-versioned-summary-student-new-2', username: 'versioned-student-new-2' },
  ],
}

const seedNewSurvey = async () => {
  const newQuestionIds: number[] = []
  for (let i = 1; i <= 5; i++) {
    const q = await Question.create({
      type: 'LIKERT',
      required: true,
      data: {
        label: {
          fi: `Uusi testikysymys ${i}`,
          en: `New test question ${i}`,
          sv: `Ny testfråga ${i}`,
        },
      },
    })
    newQuestionIds.push(q.id)
  }
  const newOpen = await Question.create({
    type: 'OPEN',
    required: false,
    data: { label: { fi: 'Uusi avoin', en: 'New open question', sv: 'Ny öppen' } },
  })
  newQuestionIds.push(newOpen.id)

  await Survey.create({
    type: 'university',
    typeId: 'VERSIONED_TEST',
    questionIds: newQuestionIds,
    validFrom: new Date('2025-08-01'),
  })

  return { newLikertIds: newQuestionIds.slice(0, 5) }
}

const seedRealisationWithFeedback = async ({
  curId,
  startDate,
  endDate,
  courseUnitId,
  orgId,
  teacherUserId,
  students,
  likertQuestionIds,
  name,
}: {
  curId: string
  startDate: Date
  endDate: Date
  courseUnitId: string
  orgId: string
  teacherUserId: string
  students: { id: string; username: string }[]
  likertQuestionIds: number[]
  name: string
}) => {
  await createTestObject(CourseRealisation, {
    id: curId,
    name: { fi: name, en: name, sv: name },
    startDate,
    endDate,
  })

  await createTestObject(CourseRealisationsOrganisation, {
    courseRealisationId: curId,
    organisationId: orgId,
    type: 'primary',
  })

  const fbt = await createTestObject(FeedbackTarget, {
    name: { fi: name, en: name, sv: name },
    courseRealisationId: curId,
    courseUnitId,
    feedbackType: 'courseRealisation',
    typeId: curId,
    opensAt: startDate,
    closesAt: endDate,
    hidden: false,
  })

  await createTestObject(UserFeedbackTarget, {
    userId: teacherUserId,
    feedbackTargetId: fbt.id,
    accessStatus: 'RESPONSIBLE_TEACHER',
  })

  for (const student of students) {
    await createTestObject(User, student)
    const fb = await createTestObject(Feedback, {
      userId: student.id,
      data: likertQuestionIds.map(qId => ({ questionId: qId, data: '5' })),
    })
    await createTestObject(UserFeedbackTarget, {
      userId: student.id,
      feedbackTargetId: fbt.id,
      feedbackId: fb.id,
      accessStatus: 'STUDENT',
    })
  }
}

export const initVersionedSummary = async ({ user }: { user: { hyPersonSisuId: string; uid: string } }) => {
  await createTestObject(User, { id: user.hyPersonSisuId, username: user.uid })

  // Use the existing seed survey as the "old" version and only add the new survey on top
  const existingSurvey = await getUniversitySurvey(new Date('2024-09-01'))
  const oldLikertIds = existingSurvey.questions!.filter(q => q.type === 'LIKERT').map(q => q.id)

  const { newLikertIds } = await seedNewSurvey()

  const org = await createTestObject(Organisation, {
    id: IDS.ORG,
    name: { fi: 'Versioitu testiorg', en: 'Versioned test org', sv: 'Versionerad testorg' },
    code: 'VERSIONED_TEST_ORG',
  })

  await createTestObject(OrganisationFeedbackCorrespondent, {
    organisationId: org.id,
    userId: user.hyPersonSisuId,
    userCreated: true,
  })

  await createTestObject(CourseUnit, {
    id: IDS.COURSE_UNIT,
    groupId: IDS.COURSE_UNIT_GROUP,
    name: { fi: 'Versioitu kurssi', en: 'Versioned test course', sv: 'Versionerad kurs' },
    courseCode: 'VERSIONED_TEST_COURSE',
  })

  await createTestObject(CourseUnitsOrganisation, {
    courseUnitId: IDS.COURSE_UNIT,
    organisationId: IDS.ORG,
    type: 'primary',
  })

  await seedRealisationWithFeedback({
    curId: IDS.CUR_OLD,
    startDate: startOfDay(new Date('2024-09-01')),
    endDate: startOfDay(new Date('2024-12-15')),
    courseUnitId: IDS.COURSE_UNIT,
    orgId: IDS.ORG,
    teacherUserId: user.hyPersonSisuId,
    students: IDS.STUDENTS_OLD,
    likertQuestionIds: oldLikertIds,
    name: 'Versioned test course old realisation',
  })

  await seedRealisationWithFeedback({
    curId: IDS.CUR_NEW,
    startDate: startOfDay(new Date('2025-09-01')),
    endDate: startOfDay(new Date('2025-12-15')),
    courseUnitId: IDS.COURSE_UNIT,
    orgId: IDS.ORG,
    teacherUserId: user.hyPersonSisuId,
    students: IDS.STUDENTS_NEW,
    likertQuestionIds: newLikertIds,
    name: 'Versioned test course new realisation',
  })

  await buildSummaries(true)
}
