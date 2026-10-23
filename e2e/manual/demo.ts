import type { APIRequestContext, Page } from '@playwright/test'

import { addDays, subDays } from 'date-fns'

import { admin, type TestUser } from '../fixtures/headers'
import { toHeaders } from '../support/api'
import { colleagues, students, teacher } from './users'

// Same as in src/server/test/manual/seed.ts
export const COURSE_CODE = 'TKT10002'

// The server and the browser run from this moment, so the day of the recording never changes the videos.
// A Wednesday in the middle of the autumn term, far from the turn of the academic year.
export const NOW = new Date('2026-11-18T12:00:00+02:00')

// Where the course is in its life cycle. Feedback opens the day after the course ends and stays open for two weeks, as by default.
export type Stage = 'ongoing' | 'feedbackOpen' | 'feedbackClosed'

const courseDates = (stage: Stage) => {
  const endDate = {
    ongoing: addDays(NOW, 14),
    feedbackOpen: subDays(NOW, 8),
    feedbackClosed: subDays(NOW, 16),
  }[stage]
  const opensAt = addDays(endDate, 1)
  return { startDate: subDays(endDate, 60), endDate, opensAt, closesAt: addDays(opensAt, 14) }
}

// Runs in the browser, like setClock in src/server/test/manual/clock.ts
const useClock = ({ now, at }: { now: number; at: number }) => {
  const RealDate: DateConstructor = (window as any).realDate ?? Date
  ;(window as any).realDate = RealDate
  const shiftedNow = () => RealDate.now() + now - at

  window.Date = new Proxy(RealDate, {
    construct: (target, args) => (args.length === 0 ? new target(shiftedNow()) : new (target as any)(...args)),
    apply: () => new RealDate(shiftedNow()).toString(),
    get: (target, prop) => (prop === 'now' ? shiftedNow : Reflect.get(target, prop)),
  })
}

export const createDemo = (request: APIRequestContext, page: Page, lang: string) => {
  let fbtId: number | undefined
  let loweredQuestionIds: number[] = []

  const demo = {
    get fbtId() {
      if (fbtId === undefined) throw new Error('Seed the demo first')
      return fbtId
    },

    // The questions with red and yellow averages in the course summary
    get loweredQuestionIds() {
      return loweredQuestionIds
    },

    // Replaces all data with the demo course. With feedback, most students except the one who logs in have answered.
    // As feedback correspondent, the teacher has admin rights to the course's programme.
    seed: async (stage: Stage, { feedback = false, feedbackCorrespondent = false } = {}) => {
      const course = courseDates(stage)
      const users = [admin, teacher, ...Object.values(colleagues), ...students].map(user => ({
        ...user,
        preferredLanguage: lang,
      }))
      // The pages opened after seeding share the server's clock
      await page.addInitScript(useClock, { now: NOW.getTime(), at: Date.now() })
      const response = await request.post('/test/seed-manual', {
        data: {
          now: NOW.toISOString(),
          users,
          teacherId: teacher.hyPersonSisuId,
          colleagues: {
            teacherId: colleagues.teacher.hyPersonSisuId,
            administrativePersonId: colleagues.administrativePerson.hyPersonSisuId,
          },
          feedbackCorrespondentIds: feedbackCorrespondent ? [teacher.hyPersonSisuId] : [],
          studentIds: students.map(user => user.hyPersonSisuId),
          feedbackFromIds: feedback ? students.slice(1, 18).map(user => user.hyPersonSisuId) : [],
          course,
        },
        timeout: 120_000,
        failOnStatusCode: true,
      })
      const body = await response.json()
      fbtId = body.id
      loweredQuestionIds = body.loweredQuestionIds
      return course
    },

    giveContinuousFeedback: (user: TestUser, text: string) =>
      request.post(`/api/continuous-feedback/${demo.fbtId}`, {
        headers: toHeaders(user),
        data: { feedback: text },
        failOnStatusCode: true,
      }),
  }

  return demo
}

export type Demo = ReturnType<typeof createDemo>
