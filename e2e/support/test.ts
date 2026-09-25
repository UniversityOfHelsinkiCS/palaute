import { test as base, expect, type Locator, type Page } from '@playwright/test'

import { testUsers, type TestUser } from '../fixtures/headers'
import { createApi, type Api } from './api'

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Like cy.contains: case-sensitive substring match, first match. Whitespace is optional
// because text split across elements may have none in the DOM.
export const contains = (scope: Page | Locator, text: string | RegExp, selector?: string) => {
  const pattern = typeof text === 'string' ? new RegExp(escapeRegExp(text).replace(/\s+/g, '\\s*')) : text
  const locator = selector ? scope.locator(selector, { hasText: pattern }) : scope.getByText(pattern)
  return locator.first()
}

export const byDataCy = (page: Page, dataCy: string) => page.locator(`[data-cy="${dataCy}"]`)

// The input itself, or the input inside a MUI TextField/Autocomplete wrapper
export const textField = (page: Page, dataCy: string) =>
  page.locator(`:is(input, textarea)[data-cy="${dataCy}"], [data-cy="${dataCy}"] :is(input, textarea)`).first()

export const addSurveyQuestions = async (page: Page) => {
  await byDataCy(page, 'question-editor-add-question').click()
  await byDataCy(page, 'question-editor-type-menu-select-likert').click()
  await page.locator('[id="likert-label-en-questions.0"]').fill('Rate the importance of testing')
  await page.locator('[id="likert-description-en-questions.0"]').fill('Something something')
  await byDataCy(page, 'question-card-save-edit').click()

  await byDataCy(page, 'question-editor-add-question').click()
  await byDataCy(page, 'question-editor-type-menu-select-single-choice').click()
  await page.locator('[id="choice-question-en-questions.1"]').fill('What is your favorite type of testing')
  await page.locator('[id="choice-description-en-questions.1"]').fill('Something something else')

  const options = ['E2E testing', 'Unit testing', 'Manual testing']
  for (const [index, option] of options.entries()) {
    await byDataCy(page, 'option-editor-add-option').click()
    await textField(page, `option-editor-new-option-en-name.${index}`).fill(option)
  }

  await byDataCy(page, 'question-card-save-edit').click()
}

export const answerFeedbackForm = async (page: Page, api: Api) => {
  const answers = page.locator('input[value="5"]')
  await expect(answers.first()).toBeVisible()
  for (const answer of await answers.all()) {
    await answer.click()
  }
  const questions = await api.getUniversityQuestions()
  const openQuestion = questions.find(q => q.type === 'OPEN')!
  await page.locator(`textarea[id="${openQuestion.id}-input"]`).fill('Other comments and such')
}

type Fixtures = {
  resetDb: void
  api: Api
  loginAs: (user: TestUser) => Promise<void>
}

export const test = base.extend<Fixtures>({
  resetDb: [
    async ({ request }, use) => {
      const api = createApi(request)
      await api.resetDb()
      await api.seedUsers(testUsers)
      await use()
    },
    { auto: true },
  ],

  // Like Cypress: accept confirm dialogs and fail on uncaught app errors
  page: async ({ page }, use) => {
    const errors: Error[] = []
    page.on('dialog', dialog => dialog.accept())
    page.on('pageerror', error => {
      if (!error.message.includes('THIS_IS_A_TEST_ERROR_CAUSED_BY_ADMIN_PLEASE_IGNORE')) errors.push(error)
    })
    await use(page)
    expect(errors).toEqual([])
  },

  api: async ({ request }, use) => {
    await use(createApi(request))
  },

  loginAs: async ({ page }, use) => {
    let loginCount = 0
    await use(async user => {
      // Set the user before the app boots, once per login
      loginCount += 1
      await page.addInitScript(
        ({ user, seq }) => {
          if (Number(sessionStorage.getItem('e2eLoginSeq') ?? 0) >= seq) return
          sessionStorage.setItem('e2eLoginSeq', String(seq))
          localStorage.setItem('fakeUser', JSON.stringify(user))
        },
        { user, seq: loginCount }
      )
      await page.goto('/')
    })
  },
})

export { expect }
