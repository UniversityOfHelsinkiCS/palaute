import type { APIRequestContext, Page } from '@playwright/test'

import { admin, organisationCorrespondent, student, teacher, type TestUser } from '../fixtures/headers'
import { toHeaders } from '../support/api'
import { expect, test } from '../support/test'

type SaveQuestion = { id?: number; clientId?: string; [key: string]: unknown }

const textQuestion = (text: string, extra: Record<string, unknown> = {}) => ({
  type: 'TEXT',
  required: false,
  data: { content: { fi: text, en: text, sv: text } },
  ...extra,
})

const likertQuestion = (label: string, extra: Record<string, unknown> = {}) => ({
  type: 'LIKERT',
  required: false,
  data: { label: { fi: label, en: label, sv: label } },
  ...extra,
})

const contentOf = (question: { data: { content?: { en: string } } }) => question.data.content?.en

const api = (request: APIRequestContext) => {
  const send = async (method: string, url: string, user: TestUser, data?: unknown) => {
    const response = await request.fetch(url, { method, headers: toHeaders(user), data })
    const body = response.headers()['content-type']?.includes('application/json') ? await response.json() : undefined
    return { status: response.status(), body }
  }

  const getTeacherSurvey = async (fbtId: number) => {
    const { body } = await send('GET', `/api/feedback-targets/${fbtId}`, admin)
    return { ...body.surveys.teacherSurvey, publicQuestionIds: body.publicQuestionIds as number[] }
  }

  return {
    send,
    getTeacherSurvey,
    saveTeacherQuestions: (fbtId: number, questions: SaveQuestion[], questionsVersion: number, user = teacher) =>
      send('PUT', `/api/feedback-targets/${fbtId}/questions`, user, { questions, questionsVersion }),
    // Saves on top of the current version, as an editor that has just loaded the page
    saveTeacherQuestionsNow: async (fbtId: number, questions: SaveQuestion[], user = teacher) => {
      const { questionsVersion } = await getTeacherSurvey(fbtId)
      return send('PUT', `/api/feedback-targets/${fbtId}/questions`, user, { questions, questionsVersion })
    },
    setPublicity: (fbtId: number, questionId: number, isPublic: boolean, user = teacher) =>
      send('PUT', `/api/feedback-targets/${fbtId}/question-publicity`, user, { questionId, isPublic }),
  }
}

test.describe('Saving questions', () => {
  let fbtId: number

  test.beforeEach(async ({ api: testApi }) => {
    await testApi.createFeedbackTarget()
    fbtId = await testApi.getTestFbtId()
  })

  test.describe('teacher survey', () => {
    test('saves new and edited questions in the sent order and bumps the version', async ({ request }) => {
      const questions = api(request)
      const { questionsVersion } = await questions.getTeacherSurvey(fbtId)

      const created = await questions.saveTeacherQuestions(
        fbtId,
        [
          { clientId: 'a', ...textQuestion('First') },
          { clientId: 'b', ...textQuestion('Second') },
        ],
        questionsVersion
      )
      expect(created.status).toBe(200)
      expect(created.body.questionsVersion).toBe(questionsVersion + 1)
      const { a, b } = created.body.createdIds
      expect(created.body.questions.map((q: { id: number }) => q.id)).toEqual([a, b])

      const edited = await questions.saveTeacherQuestions(
        fbtId,
        [
          { id: b, ...textQuestion('Second edited') },
          { id: a, ...textQuestion('First') },
        ],
        created.body.questionsVersion
      )
      expect(edited.status).toBe(200)
      expect(edited.body.questionsVersion).toBe(questionsVersion + 2)

      const survey = await questions.getTeacherSurvey(fbtId)
      expect(survey.questionIds).toEqual([b, a])
      expect(survey.questions.map(contentOf)).toEqual(['Second edited', 'First'])
      expect(survey.questionsVersion).toBe(questionsVersion + 2)
    })

    test('refuses a save based on an outdated version and writes nothing', async ({ request }) => {
      const questions = api(request)
      const { body } = await questions.saveTeacherQuestionsNow(fbtId, [
        { clientId: 'a', ...textQuestion('First') },
        { clientId: 'b', ...textQuestion('Second') },
      ])
      const { a, b } = body.createdIds
      const loadedVersion = body.questionsVersion

      // Both editors loaded the same version, A saves first
      const first = await questions.saveTeacherQuestions(
        fbtId,
        [
          { id: a, ...textQuestion('First by A') },
          { id: b, ...textQuestion('Second') },
        ],
        loadedVersion
      )
      expect(first.status).toBe(200)

      // B changes another question and adds one, based on the version A's save replaced
      const second = await questions.saveTeacherQuestions(
        fbtId,
        [
          { id: a, ...textQuestion('First') },
          { id: b, ...textQuestion('Second by B') },
          { clientId: 'c', ...textQuestion('Third by B') },
        ],
        loadedVersion
      )
      expect(second.status).toBe(409)

      const survey = await questions.getTeacherSurvey(fbtId)
      expect(survey.questions.map(contentOf)).toEqual(['First by A', 'Second'])
      expect(survey.questionsVersion).toBe(loadedVersion + 1)

      // After reloading, B saves on top of A's change
      const retried = await questions.saveTeacherQuestions(
        fbtId,
        [
          { id: a, ...textQuestion('First by A') },
          { id: b, ...textQuestion('Second by B') },
        ],
        survey.questionsVersion
      )
      expect(retried.status).toBe(200)
    })

    test('lets only one of two simultaneous saves of the same version through', async ({ request }) => {
      const questions = api(request)
      const { questionsVersion } = await questions.getTeacherSurvey(fbtId)

      const results = await Promise.all(
        ['A', 'B'].map(name =>
          questions.saveTeacherQuestions(fbtId, [{ clientId: name, ...textQuestion(`By ${name}`) }], questionsVersion)
        )
      )
      expect(results.map(r => r.status).sort((x, y) => x - y)).toEqual([200, 409])

      const survey = await questions.getTeacherSurvey(fbtId)
      expect(survey.questions).toHaveLength(1)
      expect(survey.questionsVersion).toBe(questionsVersion + 1)
    })

    test('refuses questions of another survey and duplicates', async ({ request, api: testApi }) => {
      const questions = api(request)
      const [universityQuestion] = await testApi.getUniversityQuestions()

      const foreign = await questions.saveTeacherQuestionsNow(fbtId, [
        { id: universityQuestion.id, ...textQuestion('Taken over') },
      ])
      expect(foreign.status).toBe(400)
      const [afterwards] = await testApi.getUniversityQuestions()
      expect(afterwards.data).toEqual(universityQuestion.data)

      const { body } = await questions.saveTeacherQuestionsNow(fbtId, [{ clientId: 'a', ...textQuestion('First') }])
      const { a } = body.createdIds
      const duplicate = await questions.saveTeacherQuestionsNow(fbtId, [
        { id: a, ...textQuestion('First') },
        { id: a, ...textQuestion('First again') },
      ])
      expect(duplicate.status).toBe(400)
    })

    test('refuses a save without a version', async ({ request }) => {
      const { status } = await api(request).send('PUT', `/api/feedback-targets/${fbtId}/questions`, teacher, {
        questions: [{ clientId: 'a', ...textQuestion('First') }],
      })
      expect(status).toBe(400)
    })

    test('removes left out questions and their publicity', async ({ request }) => {
      const questions = api(request)
      const { body } = await questions.saveTeacherQuestionsNow(fbtId, [
        { clientId: 'a', ...textQuestion('Public', { public: true }) },
        { clientId: 'b', ...textQuestion('Private', { public: false }) },
      ])
      const { a, b } = body.createdIds
      const before = await questions.getTeacherSurvey(fbtId)
      expect(before.publicQuestionIds).toContain(a)
      expect(before.publicQuestionIds).not.toContain(b)

      expect((await questions.saveTeacherQuestionsNow(fbtId, [{ id: b, ...textQuestion('Private') }])).status).toBe(200)

      const after = await questions.getTeacherSurvey(fbtId)
      expect(after.questionIds).toEqual([b])
      expect(after.publicQuestionIds).not.toContain(a)
    })

    test('changes publicity one question at a time, apart from the question save', async ({ request }) => {
      const questions = api(request)
      const { body } = await questions.saveTeacherQuestionsNow(fbtId, [
        { clientId: 'a', ...textQuestion('First') },
        { clientId: 'b', ...textQuestion('Second') },
      ])
      const { a, b } = body.createdIds

      expect((await questions.setPublicity(fbtId, a, true)).body.publicQuestionIds).toContain(a)
      const both = await questions.setPublicity(fbtId, b, true)
      expect(both.body.publicQuestionIds).toEqual(expect.arrayContaining([a, b]))
      const onlyB = await questions.setPublicity(fbtId, a, false)
      expect(onlyB.body.publicQuestionIds).toContain(b)
      expect(onlyB.body.publicQuestionIds).not.toContain(a)

      // Publicity doesn't bump the version, and a question save doesn't change an existing question's publicity
      const saved = await questions.saveTeacherQuestions(
        fbtId,
        [
          { id: a, ...textQuestion('First', { public: true }) },
          { id: b, ...textQuestion('Second', { public: false }) },
        ],
        body.questionsVersion
      )
      expect(saved.status).toBe(200)
      const survey = await questions.getTeacherSurvey(fbtId)
      expect(survey.publicQuestionIds).toContain(b)
      expect(survey.publicQuestionIds).not.toContain(a)

      expect((await questions.setPublicity(fbtId, 999999, true)).status).toBe(400)
    })

    test('only lets responsible teachers save, and only before the feedback opens', async ({
      request,
      api: testApi,
    }) => {
      const questions = api(request)
      const question = { clientId: 'a', ...textQuestion('First') }

      expect((await questions.saveTeacherQuestionsNow(fbtId, [question], student)).status).toBe(403)

      await testApi.setFeedbackActive()
      expect((await questions.saveTeacherQuestionsNow(fbtId, [question], teacher)).status).toBe(403)
      expect((await questions.saveTeacherQuestionsNow(fbtId, [question], admin)).status).toBe(200)
    })
  })

  test.describe('programme survey', () => {
    test.beforeEach(async ({ api: testApi }) => {
      await testApi.seedTestOrgCorrespondent(organisationCorrespondent)
    })

    test('needs write access and the current version', async ({ request }) => {
      const { send } = api(request)
      const { body: survey } = await send('GET', '/api/surveys/programme/TEST_ORG', admin)
      const save = (questionsVersion: number, user: TestUser) =>
        send('PUT', `/api/surveys/${survey.id}/questions`, user, {
          questions: [{ clientId: 'a', ...textQuestion('Programme question') }],
          questionsVersion,
        })

      expect((await save(survey.questionsVersion, teacher)).status).toBe(403)
      const saved = await save(survey.questionsVersion, organisationCorrespondent)
      expect(saved.status).toBe(200)
      expect(saved.body.questionsVersion).toBe(survey.questionsVersion + 1)
      expect((await save(survey.questionsVersion, organisationCorrespondent)).status).toBe(409)

      const { body: after } = await send('GET', '/api/surveys/programme/TEST_ORG', admin)
      expect(after.questions.map(contentOf)).toEqual(['Programme question'])
    })

    test('applies the publicity chosen for a new question', async ({ request }) => {
      const { send } = api(request)
      const { body: survey } = await send('GET', '/api/surveys/programme/TEST_ORG', admin)
      const { body } = await send('PUT', `/api/surveys/${survey.id}/questions`, organisationCorrespondent, {
        questions: [
          { clientId: 'a', ...likertQuestion('Public', { public: true }) },
          { clientId: 'b', ...likertQuestion('Private', { public: false }) },
        ],
        questionsVersion: survey.questionsVersion,
      })
      const { a, b } = body.createdIds

      const { body: organisation } = await send('GET', '/api/organisations/TEST_ORG', admin)
      expect(organisation.publicQuestionIds).toContain(a)
      expect(organisation.publicQuestionIds).not.toContain(b)
    })

    test('changes publicity one question at a time', async ({ request }) => {
      const { send } = api(request)
      const { body: survey } = await send('GET', '/api/surveys/programme/TEST_ORG', admin)
      const { body } = await send('PUT', `/api/surveys/${survey.id}/questions`, organisationCorrespondent, {
        questions: [
          { clientId: 'a', ...textQuestion('First') },
          { clientId: 'b', ...textQuestion('Second') },
        ],
        questionsVersion: survey.questionsVersion,
      })
      const { a, b } = body.createdIds
      const setPublicity = (questionId: number, isPublic: boolean) =>
        send('PUT', '/api/organisations/TEST_ORG/question-publicity', organisationCorrespondent, {
          questionId,
          isPublic,
        })

      await setPublicity(a, true)
      const both = await setPublicity(b, true)
      expect(both.body.publicQuestionIds).toEqual(expect.arrayContaining([a, b]))
      const onlyB = await setPublicity(a, false)
      expect(onlyB.body.publicQuestionIds).toContain(b)
      expect(onlyB.body.publicQuestionIds).not.toContain(a)

      expect((await setPublicity(999999, true)).status).toBe(403)
    })
  })

  test('university survey needs an admin and the current version', async ({ request }) => {
    const { send } = api(request)
    const { body: survey } = await send('GET', `/api/surveys/university?at=${new Date().toISOString()}`, admin)
    const current = survey.questions.map(({ id, type, required, data }: SaveQuestion) => ({ id, type, required, data }))
    const save = (questionsVersion: number, user: TestUser) =>
      send('PUT', `/api/surveys/${survey.id}/questions`, user, { questions: current, questionsVersion })

    expect((await save(survey.questionsVersion, teacher)).status).toBe(403)
    expect((await save(survey.questionsVersion, admin)).status).toBe(200)
    expect((await save(survey.questionsVersion, admin)).status).toBe(409)
  })
})

test.describe('Question editor saving', () => {
  let fbtId: number

  const editorUrl = () => `/targets/${fbtId}/edit`

  const savedResponse = (page: Page) =>
    page.waitForResponse(
      r => r.request().method() === 'PUT' && r.url().endsWith(`/feedback-targets/${fbtId}/questions`)
    )

  const addText = async (page: Page, text: string) => {
    await page.getByRole('button', { name: 'Add textual content' }).click()
    await page.getByRole('dialog').locator('textarea[id^=textual-context-text-en-questions]').fill(text)
    await page.locator('[data-cy=question-card-save-edit]').click()
  }

  const editText = async (page: Page, from: string, to: string) => {
    await page.getByRole('button', { name: `Edit textual content ${from}` }).click()
    await page.getByRole('dialog').locator('textarea[id^=textual-context-text-en-questions]').fill(to)
  }

  test.beforeEach(async ({ api: testApi, loginAs, page }) => {
    await testApi.createFeedbackTarget()
    fbtId = await testApi.getTestFbtId()
    await loginAs(teacher)
    await page.goto(editorUrl())
    await expect(page.getByRole('button', { name: 'Add textual content' })).toBeVisible()
  })

  test('keeps a change made while an earlier save is still running', async ({ page, request }) => {
    let delayed = false
    await page.route(`**/feedback-targets/${fbtId}/questions`, async route => {
      if (!delayed) {
        delayed = true
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
      await route.continue()
    })
    const statuses: number[] = []
    page.on('response', r => {
      if (r.request().method() === 'PUT' && r.url().endsWith('/questions')) statuses.push(r.status())
    })

    await addText(page, 'First')
    await addText(page, 'Second')
    await expect.poll(() => statuses).toEqual([200, 200])

    const survey = await api(request).getTeacherSurvey(fbtId)
    expect(survey.questions.map(contentOf)).toEqual(['First', 'Second'])
    await expect(page.getByRole('button', { name: 'Edit textual content Second' })).toBeVisible()
  })

  test('saves a new question again as an edit, not as a copy', async ({ page, request }) => {
    const created = savedResponse(page)
    await addText(page, 'New')
    await created

    const edited = savedResponse(page)
    await editText(page, 'New', 'New edited')
    await page.locator('[data-cy=question-card-save-edit]').click()
    expect((await edited).status()).toBe(200)

    const survey = await api(request).getTeacherSurvey(fbtId)
    expect(survey.questions.map(contentOf)).toEqual(['New edited'])
  })

  test('tells about a change made elsewhere and keeps it', async ({ page, request }) => {
    const questions = api(request)
    const created = savedResponse(page)
    await addText(page, 'Original')
    await created
    const [{ id }] = (await questions.getTeacherSurvey(fbtId)).questions

    // Someone else saves after this page has loaded
    expect(
      (await questions.saveTeacherQuestionsNow(fbtId, [{ id, ...textQuestion('Changed elsewhere') }])).status
    ).toBe(200)

    const refused = savedResponse(page)
    await editText(page, 'Original', 'Mine')
    await page.locator('[data-cy=question-card-save-edit]').click()
    expect((await refused).status()).toBe(409)
    await expect(page.getByText('The questions were changed elsewhere').first()).toBeVisible()
    expect((await questions.getTeacherSurvey(fbtId)).questions.map(contentOf)).toEqual(['Changed elsewhere'])

    await page.reload()
    const saved = savedResponse(page)
    await editText(page, 'Changed elsewhere', 'Mine after reload')
    await page.locator('[data-cy=question-card-save-edit]').click()
    expect((await saved).status()).toBe(200)
  })

  test('cancelling an edit restores the question without saving', async ({ page, request }) => {
    const created = savedResponse(page)
    await addText(page, 'Original')
    await created

    let saves = 0
    page.on('request', r => {
      if (r.method() === 'PUT' && r.url().endsWith('/questions')) saves += 1
    })
    await editText(page, 'Original', 'Discarded')
    await page.locator('[data-cy=question-card-cancel-edit]').click()

    await expect(page.getByRole('button', { name: 'Edit textual content Original' })).toBeVisible()
    expect(saves).toBe(0)
    expect((await api(request).getTeacherSurvey(fbtId)).questions.map(contentOf)).toEqual(['Original'])
  })

  test('keeps the dialog open and the old publicity when a publicity change fails', async ({ page, request }) => {
    const questions = api(request)
    const { body } = await questions.saveTeacherQuestionsNow(fbtId, [
      { clientId: 'a', ...likertQuestion('Rate it', { public: true }) },
    ])
    const { a } = body.createdIds
    await page.reload()

    await page.route(`**/feedback-targets/${fbtId}/question-publicity`, route => route.fulfill({ status: 500 }))
    await page.getByRole('button', { name: 'Edit question Rate it' }).click()
    const dialog = page.getByRole('dialog')
    const isPublic = dialog.getByRole('radio', { name: 'Answers visible to enrolled students' })
    await dialog
      .getByRole('radio', { name: 'Answers visible only to responsible teachers and programme admins' })
      .check()
    await page.locator('[data-cy=question-card-save-edit]').click()

    await expect(isPublic).toBeChecked()
    await expect(dialog).toBeVisible()
    expect((await questions.getTeacherSurvey(fbtId)).publicQuestionIds).toContain(a)

    await page.unroute(`**/feedback-targets/${fbtId}/question-publicity`)
    await dialog
      .getByRole('radio', { name: 'Answers visible only to responsible teachers and programme admins' })
      .check()
    const changed = page.waitForResponse(r => r.url().endsWith('/question-publicity'))
    await page.locator('[data-cy=question-card-save-edit]').click()
    expect((await changed).status()).toBe(200)
    await expect(dialog).toBeHidden()
    expect((await questions.getTeacherSurvey(fbtId)).publicQuestionIds).not.toContain(a)
  })
})
