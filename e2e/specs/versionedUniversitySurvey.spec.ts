import type { Page } from '@playwright/test'

import { summaryUser, student } from '../fixtures/headers'
import { contains, expect, test } from '../support/test'

const selectYear = async (page: Page, year: string) => {
  await page.locator('#year-selector').click()
  await page.locator(`[data-cy="year-selector-item-${year}"]`).click()
}

const expectOldQuestions = async (page: Page) => {
  await expect(contains(page, 'Test question 1')).toBeAttached()
  await expect(contains(page, 'New test question 1')).not.toBeAttached()
}

const expectNewQuestions = async (page: Page) => {
  await expect(contains(page, 'New test question 1')).toBeAttached()
  await expect(contains(page, 'Test question 1')).not.toBeAttached()
}

test.describe('Versioned university survey questions in summary view', () => {
  test.beforeEach(async ({ api, loginAs }) => {
    await api.initVersionedSummary(summaryUser)
    await loginAs(summaryUser)
  })

  test('my-organisations view: shows old questions for 2024-2025 and new questions for 2025-2026', async ({ page }) => {
    await page.goto('/course-summary/my-organisations')

    // Defaults to the current study year, which has no seeded data
    await expect(page.locator('#year-selector')).toBeVisible({ timeout: 12_000 })
    await selectYear(page, '2025–2026')
    await expect(contains(page, 'Versioned test org')).toBeAttached({ timeout: 12_000 })

    // The synthetic survey version cutover is 2025-08-01
    await selectYear(page, '2024–2025')
    await expectOldQuestions(page)

    await selectYear(page, '2025–2026')
    await expectNewQuestions(page)
  })

  test('Shows old questions for 2024-2025 and new questions for 2025-2026', async ({ page }) => {
    await page.goto('/organisations/VERSIONED_TEST_ORG/summary')

    await selectYear(page, '2024–2025')
    await expectOldQuestions(page)

    await selectYear(page, '2025–2026')
    await expectNewQuestions(page)
  })

  test.describe('Feedback form uses the survey version active at FBT opensAt', () => {
    test('FBT opened before cutover shows old survey questions', async ({ page, api, loginAs }) => {
      const [fbt] = await api.createFeedbackTarget({ opensAt: '2025-03-01', closesAt: '2099-12-31' })
      await loginAs(student)
      await page.goto(`/targets/${fbt.id}`)
      await expectOldQuestions(page)
    })

    test('FBT opened after cutover shows new survey questions', async ({ page, api, loginAs }) => {
      const [fbt] = await api.createFeedbackTarget({ opensAt: '2025-09-01', closesAt: '2099-12-31' })
      await loginAs(student)
      await page.goto(`/targets/${fbt.id}`)
      await expectNewQuestions(page)
    })
  })

  test('course-unit-group all-time view: shows both survey groups with correct questions and timeframes', async ({
    page,
  }) => {
    await page.goto('/course-summary/course-unit/VERSIONED_TEST_COURSE')

    // Switch to the "All" toggle
    await page.locator('#all-filter-selector button').first().click()

    await expect(contains(page, 'Test question 1')).toBeAttached()
    await expect(contains(page, 'New test question 1')).toBeAttached()

    // New group is open-ended, old group ends at the new group's start
    await expect(contains(page, '2025–')).toBeAttached()
    await expect(contains(page, '2024–2025')).toBeAttached()
  })
})
