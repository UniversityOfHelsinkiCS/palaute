import type { Page } from '@playwright/test'

import { subDays } from 'date-fns'

import { admin, student } from '../fixtures/headers'
import { answerFeedbackForm, contains, expect, test } from '../support/test'

const visitStudentTokenLink = async (page: Page, fbtId: number) => {
  await page.goto(`/targets/${fbtId}/togen`)
  // Get the token link text
  const tokenLinkText = await page.locator(`[data-cy=noad-token-${student.studentNumber}]`).textContent()
  await page.goto(tokenLinkText!)
}

test.describe('Noad user', () => {
  test.beforeEach(async ({ page, api, loginAs }) => {
    await api.createFeedbackTarget({ extraStudents: 5 })
    await api.setFeedbackActive()
    const fbtId = await api.getTestFbtId()
    await loginAs(admin)
    await visitStudentTokenLink(page, fbtId)
  })

  test('should see feedback target and be able to navigate to it', async ({ page, api }) => {
    await expect(contains(page, 'My feedback')).toBeAttached()
    await expect(contains(page, 'TEST_COURSE')).toBeAttached()

    await page.locator('[data-cy=give-feedback-link]').click()

    await answerFeedbackForm(page, api)
    await page.locator('[data-cy=feedback-view-give-feedback]').click()
    await expect(contains(page, 'Thank you for the feedback')).toBeAttached()
  })
})

test.describe('Noad user with an expired link', () => {
  // The token expires NOAD_LINK_EXPIRATION_DAYS (14) days after the feedback target closes,
  // so a target that closed long enough ago yields an already expired token.
  test.beforeEach(async ({ page, api, loginAs }) => {
    await api.createFeedbackTarget({
      opensAt: subDays(new Date(), 60),
      closesAt: subDays(new Date(), 40),
    })
    const fbtId = await api.getTestFbtId()
    await loginAs(admin)
    await visitStudentTokenLink(page, fbtId)
  })

  test('should not be logged in, and should be told so instead of seeing an error', async ({ page }) => {
    await expect(contains(page, 'you are currently not logged in')).toBeAttached({ timeout: 20_000 })
    await expect(contains(page, 'My feedback')).not.toBeAttached()
  })
})
