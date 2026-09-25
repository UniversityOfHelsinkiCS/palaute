import type { APIRequestContext } from '@playwright/test'

import { addDays } from 'date-fns'

import { admin, student, teacher, type TestUser } from '../fixtures/headers'

type RequestOptions = {
  headers?: TestUser
  data?: unknown
  timeout?: number
}

export const toHeaders = (user: TestUser): Record<string, string> =>
  Object.fromEntries(Object.entries(user).map(([key, value]) => [key, Array.isArray(value) ? value.join(';') : value]))

export type FeedbackTarget = { id: number; [key: string]: any }
export type Question = { id: number; type: string; [key: string]: any }

export const createApi = (request: APIRequestContext) => {
  const send = async (method: 'GET' | 'POST' | 'PUT', url: string, { headers, data, timeout }: RequestOptions = {}) => {
    const response = await request.fetch(url, {
      method,
      headers: headers ? toHeaders(headers) : undefined,
      data,
      timeout,
      failOnStatusCode: true,
    })
    const isJson = response.headers()['content-type']?.includes('application/json')
    return isJson ? response.json() : undefined
  }

  const api = {
    resetDb: () => send('POST', '/test/reset-db'),

    seedUsers: (users: TestUser[]) => send('POST', '/test/seed-users', { data: users }),

    buildSummaries: () =>
      send('POST', '/api/admin/build-summaries', {
        headers: admin,
        data: { forceAll: false },
      }),

    createFeedbackTarget: async ({
      enrolledStudent = student,
      extraStudents = 0,
      opensAt,
      closesAt,
    }: {
      enrolledStudent?: TestUser
      extraStudents?: number
      opensAt?: Date | string
      closesAt?: Date | string
    } = {}): Promise<FeedbackTarget[]> => {
      const feedbackTargets = await send('POST', '/test/seed-feedback-targets', {
        data: {
          teacher,
          student: enrolledStudent,
          opensAt: opensAt ?? addDays(new Date(), 1),
          closesAt: closesAt ?? addDays(new Date(), 2),
          extraStudents,
        },
        headers: admin,
      })
      await api.buildSummaries()
      return feedbackTargets
    },

    getTestFbtId: async (): Promise<number> => (await send('GET', '/test/test-fbt-id')).id,

    getUniversityQuestions: (): Promise<Question[]> => send('GET', '/test/university-questions'),

    giveFeedback: async (headers: TestUser) => {
      const id = await api.getTestFbtId()
      const questions = await api.getUniversityQuestions()
      return send('POST', '/api/feedbacks', {
        headers,
        data: {
          feedbackTargetId: id,
          data: questions.map(q => ({ questionId: q.id, data: '3' })),
        },
      })
    },

    createOrganisationSurvey: (orgCode: string, body: unknown): Promise<FeedbackTarget> =>
      send('POST', `/api/organisations/${orgCode}/surveys`, { headers: admin, data: body }),

    giveOrganisationSurveyFeedback: async (survey: FeedbackTarget, headers: TestUser) => {
      const options = { headers, data: { feedbackTargetId: survey.id, data: [] } }
      for (let attempt = 0; ; attempt++) {
        try {
          return await send('POST', '/api/feedbacks', options)
        } catch (error) {
          if (attempt >= 4) throw error
        }
      }
    },

    createInterimFeedback: (parentId: number, body: unknown): Promise<FeedbackTarget> =>
      send('POST', `/api/feedback-targets/${parentId}/interimFeedbacks`, { headers: admin, data: body }),

    giveInterimFeedback: (interimFeedback: FeedbackTarget, headers: TestUser) =>
      send('POST', '/api/feedbacks', {
        headers,
        data: { feedbackTargetId: interimFeedback.id, data: [] },
      }),

    setFeedbackActive: () => setFeedbackDatesFromNow(-14, 14),
    setFeedbackNotYetOpen: () => setFeedbackDatesFromNow(14, 28),
    setFeedbackClosed: () => setFeedbackDatesFromNow(-28, -1),
    setFeedbackOpeningSoon: () => setFeedbackDatesFromNow(6, 28),

    setContinuousFeedbackActive: async () => {
      const id = await api.getTestFbtId()
      return send('PUT', `/api/feedback-targets/${id}`, {
        headers: admin,
        data: { continuousFeedbackEnabled: true },
      })
    },

    seedTestOrgCorrespondent: (user: TestUser) =>
      send('POST', '/test/seed-organisation-correspondent', { data: { user } }),

    initSummary: (user: TestUser) => send('POST', '/test/init-summary', { data: user }),

    initVersionedSummary: (user: TestUser) =>
      send('POST', '/test/init-versioned-summary', { data: user, timeout: 120_000 }),
  }

  const setFeedbackDatesFromNow = async (open: number, close: number) => {
    const date = new Date()
    const id = await api.getTestFbtId()
    return send('PUT', `/api/feedback-targets/${id}`, {
      headers: admin,
      data: {
        opensAt: new Date().setDate(date.getDate() + open),
        closesAt: new Date().setDate(date.getDate() + close),
      },
    })
  }

  return api
}

export type Api = ReturnType<typeof createApi>
