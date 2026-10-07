import type { APIRequestContext } from '@playwright/test'

import { addDays, subDays } from 'date-fns'

import { admin, type TestUser } from '../fixtures/headers'
import { toHeaders } from '../support/api'
import { students, teacher } from './users'

// Same as in src/server/test/manual/seed.ts
export const COURSE_CODE = 'TKT10002'

// Where the course is in its life cycle. Feedback opens the day after the course ends and stays open for two weeks, as by default.
export type Stage = 'ongoing' | 'feedbackOpen' | 'feedbackClosed'

const courseDates = (stage: Stage) => {
  const endDate = {
    ongoing: addDays(new Date(), 14),
    feedbackOpen: subDays(new Date(), 8),
    feedbackClosed: subDays(new Date(), 16),
  }[stage]
  const opensAt = addDays(endDate, 1)
  return { startDate: subDays(endDate, 60), endDate, opensAt, closesAt: addDays(opensAt, 14) }
}

export const createDemo = (request: APIRequestContext, lang: string) => {
  let fbtId: number | undefined

  const demo = {
    get fbtId() {
      if (fbtId === undefined) throw new Error('Seed the demo first')
      return fbtId
    },

    // Replaces all data with the demo course. With feedback, most students except the one who logs in have answered.
    seed: async (stage: Stage, { feedback = false } = {}) => {
      const course = courseDates(stage)
      const users = [admin, teacher, ...students].map(user => ({ ...user, preferredLanguage: lang }))
      const response = await request.post('/test/seed-manual', {
        data: {
          users,
          teacherId: teacher.hyPersonSisuId,
          studentIds: students.map(user => user.hyPersonSisuId),
          feedbackFromIds: feedback ? students.slice(1, 18).map(user => user.hyPersonSisuId) : [],
          course,
        },
        timeout: 120_000,
        failOnStatusCode: true,
      })
      fbtId = (await response.json()).id
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
