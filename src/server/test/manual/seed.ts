import { addDays, subYears } from 'date-fns'

import { sequelize } from '../../db/dbConnection'
import {
  CourseRealisation,
  CourseRealisationsOrganisation,
  CourseUnit,
  CourseUnitsOrganisation,
  Feedback,
  FeedbackTarget,
  FeedbackTargetLog,
  Organisation,
  OrganisationFeedbackCorrespondent,
  Question,
  Summary,
  Survey,
  User,
  UserFeedbackTarget,
} from '../../models'
import feedbackTargetCache from '../../services/feedbackTargets/feedbackTargetCache'
import { buildSummaries } from '../../services/summary/buildSummaries'
import { userCache } from '../../services/users/cache'
import { UNIVERSITY_ROOT_ID, WORKLOAD_QUESTION_ID } from '../../util/config'
import { createTestObject } from '../utils'
import { MANUAL_TEACHER_QUESTIONS, MANUAL_UNIVERSITY_QUESTIONS } from './survey'

// Demo data for the user manual videos in e2e/manual, kept apart from the e2e test seed

const FACULTY_ID = 'manual-faculty'
const PROGRAMME_ID = 'manual-programme'
const COURSE_UNIT_ID = 'manual-course-unit'
const COURSE_UNIT_GROUP_ID = 'manual-course-unit-group'
export const MANUAL_COURSE_CODE = 'TKT10002'
const COURSE_NAME = { fi: 'Ohjelmoinnin perusteet', sv: 'Grunderna i programmering', en: 'Introduction to Programming' }

const OPEN_ANSWERS = [
  'Harjoitustehtävät auttoivat ymmärtämään luentojen asiat.',
  'Luennoilla eteni välillä liian nopeasti.',
  'Hyvä ja selkeä kurssi, kiitos!',
  'Esimerkkejä voisi olla enemmän.',
  'Palautetta tehtävistä sai nopeasti.',
  'Pajat olivat tosi hyödyllisiä, sieltä sai aina apua.',
  'Viikkotehtäviä oli paljon muiden kurssien rinnalla.',
  'Materiaali oli selkeää ja hyvin jäsenneltyä.',
  'Tentti vastasi hyvin kurssin sisältöä.',
  'Ryhmätyöt olisivat voineet olla selkeämmin ohjeistettuja.',
]

const PAST_FEEDBACK_RESPONSE =
  'Kiitos palautteesta! Harjoitustehtäviä pidettiin hyödyllisinä. Seuraavalla kerralla viikkotehtäviä on hieman vähemmän ja pajoja enemmän.'

type ManualUser = { id: string; username: string; [key: string]: unknown }

// The other two roles on the course page, so it shows every heading
type ManualColleagues = { teacherId: string; administrativePersonId: string }

type ManualCourse = {
  startDate: string
  endDate: string
  opensAt: string
  closesAt: string
}

// A fraction from 0 to 1 that only depends on the seed (FNV-1a hash), so re-recorded videos get the same answers
const seededFraction = (seed: string) => {
  let hash = 2166136261
  for (const char of seed) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
  return ((hash >>> 0) % 10000) / 10000
}

// The value of the first range the fraction falls below
const pick = <T>(fraction: number, ranges: [below: number, value: T][]) =>
  ranges.find(([below]) => fraction < below)![1]

const WORKLOAD_OPTIONS = MANUAL_UNIVERSITY_QUESTIONS.find(q => q.id === WORKLOAD_QUESTION_ID)!.data.options!

// Lowers a share of the answers by some points, so the course summary shows red and yellow besides green
const LOWERED: Record<string, { points: number; share: number }> = {
  'Opetustilanteissa opiskelijoita kannustettiin keskustelemaan ajatuksistaan ja näkökulmistaan': {
    points: 2,
    share: 1,
  },
  'Oppimisen arvioinnin vaatimukset (tentti, harjoitus, kurssisuoritus) olivat minulle selvät': {
    points: 1,
    share: 0.8,
  },
}

// Earlier realisations get slightly lower scores, so the summary shows the course improving
const answerFor = (question: Question, seed: string, level: number) => {
  const fraction = seededFraction(`${seed}-${question.id}`)
  if (question.type === 'LIKERT') {
    const score = pick(fraction, [
      [0.03, 2],
      [0.1 + level, 3],
      [0.4 + level, 4],
      [1, 5],
    ])
    const lowered = 'label' in question.data ? LOWERED[question.data.label.fi ?? ''] : undefined
    const lowering = lowered && seededFraction(`${seed}-${question.id}-lowered`) < lowered.share ? lowered.points : 0
    return String(Math.max(1, score - lowering))
  }
  if (question.type === 'SINGLE_CHOICE')
    return WORKLOAD_OPTIONS[
      pick(fraction, [
        [0.08, 0],
        [0.3, 1],
        [0.92, 2],
        [1, 3],
      ])
    ].id
  return null
}

const feedbackData = (questions: Question[], seed: string, index: number, level: number) =>
  questions.flatMap(question => {
    if (question.type === 'OPEN') {
      return index % 2 === 0 ? [{ questionId: question.id, data: OPEN_ANSWERS[(index / 2) % OPEN_ANSWERS.length] }] : []
    }
    const data = answerFor(question, `${seed}-${index}`, level)
    return data === null ? [] : [{ questionId: question.id, data }]
  })

const resetTables = async () => {
  await userCache.invalidateAll()
  await feedbackTargetCache.invalidateAll()

  await FeedbackTargetLog.destroy({ where: {}, truncate: true, cascade: true })
  await FeedbackTarget.destroy({ where: {}, truncate: true, cascade: true })
  await User.destroy({ where: {}, truncate: true, cascade: true })
  await CourseRealisation.destroy({ where: {}, truncate: true, cascade: true })
  await CourseUnit.destroy({ where: {}, truncate: true, cascade: true })
  await Organisation.destroy({ where: {}, truncate: true, cascade: true })
  await Survey.destroy({ where: {}, truncate: true, cascade: true })
  await Question.destroy({ where: {}, truncate: true, cascade: true })
  // Rebuilt from scratch, so earlier runs leave nothing behind
  await Summary.destroy({ where: {}, truncate: true })
}

const seedSurvey = async () => {
  const questions: Question[] = []
  for (const question of MANUAL_UNIVERSITY_QUESTIONS) {
    questions.push(await Question.create({ secondaryType: 'OTHER', ...question } as any))
  }
  // The workload question has a fixed id, so the id sequence must continue after it
  await sequelize.query(`SELECT setval(pg_get_serial_sequence('questions', 'id'), (SELECT MAX(id) FROM questions))`)

  await Survey.create(
    { type: 'university', typeId: UNIVERSITY_ROOT_ID, questionIds: questions.map(q => q.id) },
    { hooks: false }
  )
  return questions
}

const seedOrganisations = async () => {
  await createTestObject(Organisation, {
    id: UNIVERSITY_ROOT_ID,
    name: { fi: 'Helsingin yliopisto', sv: 'Helsingfors universitet', en: 'University of Helsinki' },
    code: 'HY',
  })
  await createTestObject(Organisation, {
    id: FACULTY_ID,
    parentId: UNIVERSITY_ROOT_ID,
    name: {
      fi: 'Matemaattis-luonnontieteellinen tiedekunta',
      sv: 'Matematisk-naturvetenskapliga fakulteten',
      en: 'Faculty of Science',
    },
    code: 'H50',
  })
  await createTestObject(Organisation, {
    id: PROGRAMME_ID,
    parentId: FACULTY_ID,
    name: {
      fi: 'Tietojenkäsittelytieteen kandiohjelma',
      sv: 'Kandidatsprogrammet i datavetenskap',
      en: "Bachelor's Programme in Computer Science",
    },
    code: 'KH50_005',
  })

  await createTestObject(CourseUnit, {
    id: COURSE_UNIT_ID,
    groupId: COURSE_UNIT_GROUP_ID,
    courseCode: MANUAL_COURSE_CODE,
    name: COURSE_NAME,
    validityPeriod: { startDate: new Date('2020-08-01') },
  })
  await createTestObject(CourseUnitsOrganisation, {
    courseUnitId: COURSE_UNIT_ID,
    organisationId: PROGRAMME_ID,
    type: 'PRIMARY',
  })
}

// By the end date, as autumn courses can start in late July
const semester = (date: Date) => {
  const year = date.getFullYear()
  return date.getMonth() >= 7
    ? { fi: `syksy ${year}`, sv: `hösten ${year}`, en: `autumn ${year}` }
    : { fi: `kevät ${year}`, sv: `våren ${year}`, en: `spring ${year}` }
}

const seedRealisation = async ({
  id,
  course,
  teacherId,
  colleagues,
  studentIds,
  past,
}: {
  id: string
  course: ManualCourse
  teacherId: string
  colleagues: ManualColleagues
  studentIds: string[]
  past: boolean
}) => {
  const term = semester(new Date(course.endDate))
  await createTestObject(CourseRealisation, {
    id,
    name: {
      fi: `${COURSE_NAME.fi}, ${term.fi}`,
      sv: `${COURSE_NAME.sv}, ${term.sv}`,
      en: `${COURSE_NAME.en}, ${term.en}`,
    },
    startDate: new Date(course.startDate),
    endDate: new Date(course.endDate),
    teachingLanguages: ['fi'],
  })
  await createTestObject(CourseRealisationsOrganisation, {
    courseRealisationId: id,
    organisationId: PROGRAMME_ID,
    type: 'PRIMARY',
  })

  const fbt = await createTestObject(FeedbackTarget, {
    name: COURSE_NAME,
    courseRealisationId: id,
    courseUnitId: COURSE_UNIT_ID,
    feedbackType: 'courseRealisation',
    typeId: id,
    opensAt: new Date(course.opensAt),
    closesAt: new Date(course.closesAt),
    hidden: false,
    // Earlier realisations are finished, so nothing about them is left to send
    ...(past && {
      feedbackResponse: PAST_FEEDBACK_RESPONSE,
      feedbackResponseEmailSent: true,
      feedbackOpeningReminderEmailSent: true,
      feedbackResponseReminderEmailSent: true,
    }),
  })

  await createTestObject(UserFeedbackTarget, {
    userId: teacherId,
    feedbackTargetId: fbt.id,
    accessStatus: 'RESPONSIBLE_TEACHER',
  })
  await createTestObject(UserFeedbackTarget, {
    userId: colleagues.teacherId,
    feedbackTargetId: fbt.id,
    accessStatus: 'TEACHER',
  })
  await createTestObject(UserFeedbackTarget, {
    userId: colleagues.administrativePersonId,
    feedbackTargetId: fbt.id,
    accessStatus: 'RESPONSIBLE_TEACHER',
    isAdministrativePerson: true,
  })
  for (const studentId of studentIds) {
    await createTestObject(UserFeedbackTarget, { userId: studentId, feedbackTargetId: fbt.id, accessStatus: 'STUDENT' })
  }
  return fbt
}

const seedTeacherSurvey = async (fbt: FeedbackTarget) => {
  const questions = await Promise.all(
    MANUAL_TEACHER_QUESTIONS.map(question => Question.create({ secondaryType: 'OTHER', ...question } as any))
  )
  await Survey.create({ feedbackTargetId: fbt.id, questionIds: questions.map(q => q.id) } as any)
}

const giveFeedback = async (fbt: FeedbackTarget, studentIds: string[], questions: Question[], level: number) => {
  for (const [index, userId] of studentIds.entries()) {
    const feedback = await Feedback.create({
      userId,
      data: feedbackData(questions, fbt.courseRealisationId, index, level),
    } as any)
    await UserFeedbackTarget.update({ feedbackId: feedback.id }, { where: { userId, feedbackTargetId: fbt.id } })
  }
}

export const seedManual = async ({
  users,
  teacherId,
  colleagues,
  feedbackCorrespondentIds,
  studentIds,
  feedbackFromIds,
  course,
}: {
  users: ManualUser[]
  teacherId: string
  colleagues: ManualColleagues
  // Get admin rights to the programme
  feedbackCorrespondentIds: string[]
  studentIds: string[]
  feedbackFromIds: string[]
  course: ManualCourse
}) => {
  await resetTables()
  const questions = await seedSurvey()
  await seedOrganisations()
  for (const user of users) await User.create(user as any)
  // Added in Norppa, as login removes the ones that IAM groups would add
  for (const userId of feedbackCorrespondentIds)
    await OrganisationFeedbackCorrespondent.create({ userId, organisationId: PROGRAMME_ID, userCreated: true })

  // Two earlier autumns with feedback and a feedback response, for the course summary
  for (const yearsAgo of [1, 2]) {
    const pastCourse = Object.fromEntries(
      Object.entries(course).map(([key, date]) => [key, subYears(new Date(date), yearsAgo).toISOString()])
    ) as ManualCourse
    // Ended long ago, so feedback for it is closed
    pastCourse.closesAt = addDays(new Date(pastCourse.opensAt), 14).toISOString()
    const pastStudentIds = Array.from({ length: 30 - yearsAgo * 2 }, (_, i) => `manual-past-student-${yearsAgo}-${i}`)
    for (const id of pastStudentIds) await User.create({ id, username: id } as any)
    const fbt = await seedRealisation({
      id: `manual-course-realisation-${yearsAgo}`,
      course: pastCourse,
      teacherId,
      colleagues,
      studentIds: pastStudentIds,
      past: true,
    })
    await giveFeedback(fbt, pastStudentIds.slice(0, 20 - yearsAgo * 3), questions, yearsAgo * 0.1)
    // Only the older one, as the newer one's questions would be copied to the current survey by themselves
    if (yearsAgo === 2) await seedTeacherSurvey(fbt)
  }

  const fbt = await seedRealisation({
    id: 'manual-course-realisation',
    course,
    teacherId,
    colleagues,
    studentIds,
    past: false,
  })
  await giveFeedback(fbt, feedbackFromIds, questions, 0)

  await buildSummaries()
  return fbt
}
