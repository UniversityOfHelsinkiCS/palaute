import { FeedbackTarget, UserFeedbackTarget, User } from '../models'
import { createTestObject } from './utils'
import { TEST_COURSE_UNIT_ID, TEST_COURSE_REALISATION_ID } from './testIds'

export const seedFeedbackTargetsForTeacher = async ({
  teacher,
  student,
  opensAt,
  closesAt,
  extraStudents = 0,
}: {
  teacher: any
  student: any
  opensAt: string
  closesAt: string
  extraStudents?: number
}) => {
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

  for (let i = 0; i < extraStudents; i++) {
    const extraStudent = await createTestObject(User, {
      id: `test-extra-student-${i}`,
      username: `test-extra-student-${i}`,
      studentNumber: `0123456${i}`,
    })

    await createTestObject(UserFeedbackTarget, {
      userId: extraStudent.id,
      feedbackTargetId: fbt.id,
      accessStatus: 'STUDENT',
    })
  }

  return [fbt]
}
