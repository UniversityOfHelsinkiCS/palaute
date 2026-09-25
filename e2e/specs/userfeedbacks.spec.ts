import type { Page } from '@playwright/test'

import { teacher, student } from '../fixtures/headers'
import { answerFeedbackForm, contains, expect, test } from '../support/test'

const notificationBadge = (page: Page) =>
  page.locator('[data-cy="navbar-link-My feedback"] > [data-cy="navbar-notification-badge"]')

test.describe('User feedbacks view', () => {
  let fbtId: number

  test.beforeEach(async ({ api }) => {
    await api.createFeedbackTarget({ extraStudents: 5 })
    await api.setFeedbackActive()
    fbtId = await api.getTestFbtId()
  })

  test('A feedback is visible after teacher has set it active', async ({ page, api, loginAs }) => {
    await loginAs(student)
    await expect(notificationBadge(page)).toBeAttached()

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

    await expect(notificationBadge(page)).not.toBeAttached()
  })

  test('Feedback is visible immediately after being given', async ({ page, api, loginAs }) => {
    await loginAs(student)
    await page.goto(`/targets/${fbtId}`)
    await answerFeedbackForm(page, api)
    await page.locator('[data-cy=feedback-view-give-feedback]').click()

    await expect(page.locator('[data-cy="feedback-target-results-tab"]')).toBeAttached()
    await expect(contains(page, 'Multiple choice questions')).toBeAttached()
  })

  test('Teacher can censor a feedback', async ({ page, api, loginAs }) => {
    await loginAs(student)
    await page.goto(`/targets/${fbtId}`)
    await answerFeedbackForm(page, api)
    await page.locator('[data-cy=feedback-view-give-feedback]').click()
    await expect(page.locator('[data-cy="feedback-target-results-tab"]')).toBeAttached()

    await loginAs(teacher)
    await page.goto(`/targets/${fbtId}/results`)
    await page.locator('[data-testid="VisibilityIcon"]').click()
    await expect(contains(page, 'This answer is hidden')).toBeAttached()

    await loginAs(student)
    await page.goto(`/targets/${fbtId}/results`)
    await expect(contains(page, 'Other comments and such')).not.toBeAttached()
  })

  test('Student can clear given feedback', async ({ page, api, loginAs }) => {
    await loginAs(student)
    await expect(notificationBadge(page)).toBeAttached()

    await page.goto(`/targets/${fbtId}`)
    await answerFeedbackForm(page, api)
    await page.locator('[data-cy=feedback-view-give-feedback]').click()
    await expect(notificationBadge(page)).not.toBeAttached()

    await page.goto('/')
    await contains(page, 'Given').click()
    await contains(page, 'Remove my feedback').click()
    await contains(page, 'Yes').click()
    await contains(page, 'Awaiting').click()
    await expect(page.locator('[data-cy=feedback-item-give-feedback]')).toBeAttached()

    await expect(notificationBadge(page)).toBeAttached()
  })
})
