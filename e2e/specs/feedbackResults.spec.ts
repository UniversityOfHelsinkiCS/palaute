import type { Locator } from '@playwright/test'

import { teacher, student } from '../fixtures/headers'
import { answerFeedbackForm, contains, expect, test } from '../support/test'

// Counts are shown as "given / total"
const readCount = async (locator: Locator) => parseInt((await locator.textContent())!.split('/')[0], 10)

test.describe('Feedback results', () => {
  let fbtId: number

  test.beforeEach(async ({ api }) => {
    await api.createFeedbackTarget({ extraStudents: 12 })
    await api.setFeedbackActive()
    fbtId = await api.getTestFbtId()
  })

  test('Feedback count increases everywhere when a student gives feedback', async ({ page, api, loginAs }) => {
    const myTeachingCount = page.locator(`[data-cy="my-teaching-feedback-target-secondary-text-${fbtId}"]`)
    const fbtPageCount = page.locator('[data-cy=feedback-target-feedback-count-percentage]')

    await loginAs(teacher)
    await page.goto('/courses')
    const myTeachingInitialCount = await readCount(myTeachingCount)

    await page.goto(`/targets/${fbtId}`)
    const fbtPageInitialCount = await readCount(fbtPageCount)

    await loginAs(student)
    await page.locator('[data-cy="navbar-link-My feedback"]').click()
    await page.locator('[data-cy=feedback-item-give-feedback]').click()
    await expect(
      contains(
        page,
        'Your name will not be shown to the teacher with your feedback. Fields marked with an asterisk (*) are required.'
      )
    ).toBeAttached()
    await answerFeedbackForm(page, api)
    await page.locator('[data-cy=feedback-view-give-feedback]').click()
    await expect(contains(page, 'Feedback has been given. Thank you for your feedback!')).toBeAttached()

    await loginAs(teacher)
    await page.goto(`/targets/${fbtId}`)
    expect(await readCount(fbtPageCount)).toBe(fbtPageInitialCount + 1)

    await page.goto('/courses')
    expect(await readCount(myTeachingCount)).toBe(myTeachingInitialCount + 1)
  })
})
