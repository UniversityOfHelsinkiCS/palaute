import type { Page } from '@playwright/test'

import { student, teacher } from '../fixtures/headers'
import { contains, expect, test } from '../support/test'

const openCourseUnit = async (page: Page, tab: 'active' | 'ended') => {
  await page.goto('/courses')
  await page.locator(`[data-cy=my-teaching-${tab}-tab]`).click()
  if (tab === 'ended') await page.locator('[data-cy=my-teaching-course-unit-accordion-TEST_COURSE]').click()
}

const expectFeedbackTargetItem = async (page: Page, id: number) => {
  await expect(page.locator(`[data-cy="my-teaching-feedback-target-item-link-${id}"]`)).toBeAttached()
  await expect(page.locator(`[data-cy="my-teaching-feedback-target-period-info-${id}"]`)).toBeAttached()
}

const addLikertQuestion = async (page: Page) => {
  await contains(page, 'Add question').click()
  await page.locator('[data-cy=question-editor-type-menu-select-likert]').click()
  await page.locator('input[id^=likert-label-en-questions]').fill('Test question')
  await page.locator('input[id^=likert-description-en-questions]').fill('Test description')
  await page.locator('[data-cy=question-card-save-edit]').click()
  await expect(page.locator('[data-cy=editQuestion]').first()).toBeAttached()
}

test.describe('Teacher view', () => {
  let fbtId: number

  test.beforeEach(async ({ api, loginAs }) => {
    await api.createFeedbackTarget({ extraStudents: 5 })
    fbtId = await api.getTestFbtId()
    await loginAs(teacher)
  })

  test('A logged in teacher can view its courses', async ({ page }) => {
    await page.goto(`/courses`)

    await expect(contains(page.locator('[id="my-teaching-title"]'), 'My surveys')).toBeAttached()

    await contains(page.locator('[data-cy=my-teaching-active-tab]'), 'Active').click()
    await expect(page.locator('[data-cy="my-teaching-no-courses"]')).toBeAttached()

    await contains(page.locator('[data-cy=my-teaching-upcoming-tab]'), 'Upcoming').click()
    await expect(page.locator('[data-cy="my-teaching-no-courses"]')).toBeAttached()

    await contains(page.locator('[data-cy="my-teaching-ended-tab"]'), 'Ended').click()
    await expect(page.locator('[data-cy="my-teaching-no-courses"]')).not.toBeAttached()

    const courseSurveys = page.locator('[data-cy="course-unit-group-title-Course surveys"] > *')
    await expect(courseSurveys).toHaveCount(1)
    await expect(courseSurveys).toHaveAttribute('aria-label', '1 Survey')

    await expect(page.locator('[data-cy="course-unit-group-title-Organisation surveys"]')).not.toBeAttached()

    await page.locator('[data-cy=my-teaching-course-unit-accordion-TEST_COURSE]').click()
    await expectFeedbackTargetItem(page, fbtId)
    await page.locator(`a[href*="/targets/${fbtId}"]`).first().click()
  })

  test('Teacher view feedback chips are rendered correctly', async ({ page, api }) => {
    // Continuous feedback chip
    await api.setFeedbackOpeningSoon()
    await api.setContinuousFeedbackActive()
    await openCourseUnit(page, 'ended')
    await expectFeedbackTargetItem(page, fbtId)
    await expect(page.locator(`[data-cy="feedback-response-chip-continuous-${fbtId}"]`)).toBeAttached()

    // Ongoing feedback chip
    await api.setFeedbackActive()
    await openCourseUnit(page, 'active')
    await expect(page.locator('[data-cy="my-teaching-no-courses"]')).not.toBeAttached()
    await expect(page.locator('[data-cy=my-teaching-course-unit-item-TEST_COURSE]')).toBeAttached()
    await expectFeedbackTargetItem(page, fbtId)
    await page.locator(`[data-cy="feedback-response-chip-open-${fbtId}"]`).click()

    // Missing counter feedback badge on the status tab
    await api.giveFeedback(student)
    await api.setFeedbackClosed()
    await page.goto(`/courses`)
    await page.locator('[data-cy=my-teaching-ended-tab]').click()
    await expect(contains(page.locator('[data-cy="status-tab-badge"]'), '1')).toBeAttached()
    await page.locator('[data-cy=my-teaching-ended-tab]').hover()
    await expect(contains(page, 'Ended: 1 missing counter feedbacks from the last academic year')).toBeVisible()

    // Missing counter feedback chip on the course unit and feedback target level
    await expect(page.locator(`[data-cy="feedback-response-chip-missing-${fbtId}"]`).first()).toBeAttached()
    await page.locator('[data-cy=my-teaching-course-unit-accordion-TEST_COURSE]').click()
    await expectFeedbackTargetItem(page, fbtId)
    await page.locator(`[data-cy="feedback-response-chip-missing-${fbtId}"]`).first().click()

    // Save the counter feedback without sending the email
    await page.locator('textarea').first().fill('Counter feedback for students to see')
    await page.locator('[data-cy="feedback-response-send-email-checkbox"]').click()
    await page.locator('[data-cy=openFeedbackResponseSubmitDialog]').click()
    await expect(contains(page, 'Information has been saved.')).toBeAttached()

    await openCourseUnit(page, 'ended')
    await expectFeedbackTargetItem(page, fbtId)
    await page.locator(`[data-cy="feedback-response-chip-not-sent-${fbtId}"]`).first().click()

    // Send the counter feedback email
    await page.locator('[data-cy=openFeedbackResponseSubmitDialog]').click()
    await page.locator('[data-cy=saveFeedbackResponse]').click()
    await expect(contains(page, 'Information has been saved.')).toBeAttached()

    await openCourseUnit(page, 'ended')
    await expectFeedbackTargetItem(page, fbtId)
    await page.locator(`[data-cy="feedback-response-chip-given-${fbtId}"]`).first().click()

    // Interim feedback chip
    await api.setFeedbackActive()
    const today = new Date()
    await api.createInterimFeedback(fbtId, {
      name: { fi: 'Testi välipalaute', en: 'Test interim feedback', sv: '' },
      startDate: today,
      endDate: new Date().setDate(today.getDate() + 7),
    })
    await openCourseUnit(page, 'active')
    await expect(page.locator(`[data-cy="my-teaching-course-unit-item-TEST_COURSE"]`)).toBeAttached()
    await expectFeedbackTargetItem(page, fbtId)
    await expect(page.locator(`[data-cy="interim-feedback-chip-${fbtId}"]`)).toBeAttached()
  })

  test('A logged in teacher can give counter feedback for an ended course', async ({ page, api }) => {
    await api.setFeedbackClosed()

    await openCourseUnit(page, 'ended')
    await page.goto(`/targets/${fbtId}/edit-feedback-response`)
    await page.locator('textarea').first().fill('Counter feedback for students to see')
    await page.locator('[data-cy=openFeedbackResponseSubmitDialog]').click()
    await page.locator('[data-cy=saveFeedbackResponse]').click()
    await expect(contains(page, 'Information has been saved.')).toBeAttached()

    await page.goto(`/courses`)
    await contains(page.locator('[data-cy=my-teaching-ended-tab]'), 'Ended').click()
    await contains(page, 'TEST_COURSE').click()
    await expect(page.locator(`[data-cy=feedback-response-chip-given-${fbtId}]`).first()).toBeAttached()
  })

  test('Teacher can add questions to a survey', async ({ page }) => {
    await page.goto(`/targets/${fbtId}/edit`)
    await addLikertQuestion(page)
    await page.reload()
    await expect(contains(page, 'Test question')).toBeAttached()
    await expect(contains(page, 'Test description')).toBeAttached()
  })

  test('Teacher can edit a question', async ({ page }) => {
    await page.goto(`/targets/${fbtId}/edit`)
    await addLikertQuestion(page)
    await page.reload()

    await page.locator('[data-cy=editQuestion]').first().click()
    const label = page.locator('input[id^=likert-label-en-questions]')
    const description = page.locator('input[id^=likert-description-en-questions]')
    await label.fill(`${await label.inputValue()} edited`)
    await description.fill(`${await description.inputValue()} edited`)
    await page.locator('[data-cy=question-card-save-edit]').click()
    await expect(page.locator('[data-cy=editQuestion]').first()).toBeAttached()
    await page.reload()
    await expect(contains(page, 'Test question edited')).toBeAttached()
    await expect(contains(page, 'Test description edited')).toBeAttached()
  })

  test('Teacher can view survey results', async ({ page, api }) => {
    await api.setFeedbackActive()
    await api.giveFeedback(student)
    await page.goto(`/courses`)
    await contains(page, 'TEST_COURSE').click()
    await page.locator(`a[href*="/targets/${fbtId}"]`).first().click()
    await page.goto(`/targets/${fbtId}/results`)
    await contains(page, 'Feedback').click()
    await expect(contains(page, 'Multiple choice questions')).toBeAttached()
  })
})
