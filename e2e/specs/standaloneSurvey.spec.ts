import type { APIRequestContext, Page } from '@playwright/test'

import { addDays, subDays } from 'date-fns'

import { admin, getFullName, student, studentHenri, teacher, type TestUser } from '../fixtures/headers'
import { toHeaders } from '../support/api'
import { addSurveyQuestions, byDataCy, contains, expect, test, textField } from '../support/test'

const api = (request: APIRequestContext) => {
  const send = async (method: string, url: string, user: TestUser, data?: unknown) => {
    const response = await request.fetch(`/api/standalone-surveys${url}`, { method, headers: toHeaders(user), data })
    const body = response.headers()['content-type']?.includes('application/json') ? await response.json() : undefined
    return { status: response.status(), body }
  }

  return {
    create: async (overrides: Record<string, unknown> = {}) =>
      (
        await send('POST', '', admin, {
          name: { fi: 'Henkilöstökysely', en: 'Staff survey', sv: 'Personalenkät' },
          opensAt: subDays(new Date(), 1),
          closesAt: addDays(new Date(), 7),
          responsibleUserIds: [teacher.hyPersonSisuId],
          ...overrides,
        })
      ).body.id as number,
    get: (id: number, user: TestUser = admin) => send('GET', `/${id}`, user),
    update: (id: number, data: unknown, user: TestUser = admin) => send('PUT', `/${id}`, user, data),
    setQuestions: (id: number, questions: unknown[], user: TestUser = admin) =>
      send('PUT', `/${id}/questions`, user, { questions }),
    answer: (token: string, data: unknown[], user: TestUser) =>
      send('PUT', `/answer/${token}/response`, user, { data }),
    deleteAnswer: (token: string, user: TestUser) => send('DELETE', `/answer/${token}/response`, user),
    results: (token: string, user: TestUser) => send('GET', `/answer/${token}/results`, user),
  }
}

const likert = { type: 'LIKERT', required: true, data: { label: { en: 'I like my job' } }, visibility: 'PUBLIC' }
const open = { type: 'OPEN', required: false, data: { label: { en: 'Anything else?' } }, visibility: 'PRIVATE' }

const setupSurvey = async (request: APIRequestContext) => {
  const surveys = api(request)
  const id = await surveys.create()
  const { body } = await surveys.setQuestions(id, [likert, open])
  return { id, token: body.token as string, likertId: body.questions[0].id as number, openId: body.questions[1].id }
}

const answerOnPage = async (page: Page, token: string) => {
  await page.goto(`/survey/${token}`)
  await page.locator('input[value="4"]').first().click()
  await page.locator('textarea').first().fill('Remote days are great')
  await byDataCy(page, 'feedback-view-give-feedback').click()
}

test.describe('Standalone surveys', () => {
  test('admin creates a survey and adds questions', async ({ page, loginAs }) => {
    await loginAs(admin)
    await page.goto('/admin/standalone-surveys')
    await contains(page, 'Create survey', 'button').click()

    await textField(page, 'formik-locales-field-en-name').fill('Staff survey')
    await textField(page, 'formik-responsible-teacher-input-field').fill(getFullName(teacher))
    await contains(page, getFullName(teacher), '.MuiAutocomplete-popper [role="option"]').click()
    await page.locator('[role="dialog"] button[type="submit"]').click()

    await expect(page).toHaveURL(/\/standalone-surveys\/\d+\/edit/)
    await addSurveyQuestions(page)
    await expect(contains(page, 'Rate the importance of testing')).toBeVisible()
  })

  test('respondent answers, edits and removes their answer', async ({ page, loginAs, request }) => {
    const { token } = await setupSurvey(request)

    await loginAs(student)
    await answerOnPage(page, token)
    await expect(page).toHaveURL(new RegExp(`/survey/${token}/results`))
    await expect(contains(page, 'I like my job')).toBeVisible()
    await expect(contains(page, 'Anything else?')).not.toBeVisible()

    await page.goto(`/survey/${token}`)
    await expect(byDataCy(page, 'feedback-view-give-feedback')).toContainText('Edit')
    await contains(page, 'Remove my answer', 'button').click()
    await expect(byDataCy(page, 'feedback-view-give-feedback')).not.toContainText('Edit')
  })

  test('one answer per person and results only after answering while open', async ({ request }) => {
    const surveys = api(request)
    const { token, likertId } = await setupSurvey(request)

    expect((await surveys.results(token, student)).status).toBe(403)

    expect((await surveys.answer(token, [{ questionId: likertId, data: '5' }], student)).status).toBe(200)
    expect((await surveys.answer(token, [{ questionId: likertId, data: '2' }], student)).status).toBe(200)

    const { status, body } = await surveys.results(token, student)
    expect(status).toBe(200)
    expect(body.responseCount).toBe(1)
    expect(body.feedbacks[0].data).toEqual([{ questionId: likertId, data: '2' }])
    expect((await surveys.results(token, studentHenri)).status).toBe(403)
  })

  test('answering is refused outside the answering period', async ({ request }) => {
    const surveys = api(request)
    const { id, token, likertId } = await setupSurvey(request)
    const answer = [{ questionId: likertId, data: '3' }]

    await surveys.update(id, { opensAt: addDays(new Date(), 1), closesAt: addDays(new Date(), 2) })
    expect((await surveys.answer(token, answer, student)).status).toBe(403)

    await surveys.update(id, { opensAt: subDays(new Date(), 2), closesAt: subDays(new Date(), 1) })
    expect((await surveys.answer(token, answer, student)).status).toBe(403)
    expect((await surveys.results(token, studentHenri)).status).toBe(200)
  })

  test('only responsible persons and admins can manage a survey', async ({ page, loginAs, request }) => {
    const surveys = api(request)
    const { id, token, likertId } = await setupSurvey(request)
    await surveys.answer(token, [{ questionId: likertId, data: '4' }], student)

    expect((await surveys.get(id, studentHenri)).status).toBe(403)
    expect((await surveys.get(id, teacher)).status).toBe(200)
    expect((await surveys.update(id, { opensAt: addDays(new Date(), 1) }, teacher)).status).toBe(403)

    await loginAs(teacher)
    await page.goto('/courses')
    await contains(page, 'Staff survey').click()
    await expect(page).toHaveURL(new RegExp(`/standalone-surveys/${id}`))
    await page.goto(`/standalone-surveys/${id}/results`)
    await expect(contains(page, '1 answer')).toBeVisible()
  })
})
