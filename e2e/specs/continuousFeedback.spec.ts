import type { Page } from '@playwright/test'

import type { FeedbackTarget } from '../support/api'

import { teacher, student } from '../fixtures/headers'
import { contains, expect, test, textField } from '../support/test'

const openContinuousFeedbackTab = async (page: Page, fbt: FeedbackTarget) => {
  await page.goto('/courses')
  await page.locator('[data-cy=my-teaching-ended-tab]').click()
  await page.locator('[data-cy=my-teaching-course-unit-accordion-TEST_COURSE]').click()
  await page.locator(`[data-cy="my-teaching-feedback-target-item-link-${fbt.id}"]`).click()
  await page.locator('[data-cy="feedback-target-continuous-feedback-tab"]').click()
}

test.describe('Continuous feedback', () => {
  let fbt: FeedbackTarget

  test.beforeEach(async ({ api, loginAs }) => {
    ;[fbt] = await api.createFeedbackTarget({ extraStudents: 5 })
    await loginAs(teacher)
  })

  test('Teacher can enable continuous feedback, student can then give it, teacher can then respond to it and student can see the response', async ({
    page,
    loginAs,
  }) => {
    await openContinuousFeedbackTab(page, fbt)
    await page.locator('[data-cy=activateContinuousFeedback]').click()
    await expect(contains(page, 'Information has been saved')).toBeAttached()

    await loginAs(student)
    await page.locator('[data-cy=my-feedbacks-continuous-tab]').click()
    await page.locator('[data-cy=giveContinuousFeedback]').click()
    await page.locator('textarea').first().fill('Giving continuous feedback')
    await contains(page, 'Send feedback').click()
    await expect(contains(page, 'Feedback has been sent succesfully')).toBeAttached()
    await expect(contains(page, 'Giving continuous feedback')).toBeAttached()

    await loginAs(teacher)
    await openContinuousFeedbackTab(page, fbt)
    await expect(contains(page, 'Giving continuous feedback')).toBeAttached()
    await page.locator('[data-cy=respondContinuousFeedback]').click()
    await textField(page, 'continuousFeedbackResponseInput').fill('Responding to continuous feedback')
    await page.locator('[data-cy=sendContinuousFeedbackResponse]').click()
    await expect(contains(page, 'Response sent succesfully')).toBeAttached()
    await expect(contains(page, 'Responding to continuous feedback')).toBeAttached()

    await loginAs(student)
    await page.locator('[data-cy=my-feedbacks-continuous-tab]').click()
    await page.locator('[data-cy=giveContinuousFeedback]').click()
    await expect(contains(page, 'Responding to continuous feedback')).toBeAttached()
  })
})
