import { teacher, student } from '../fixtures/headers'
import { answerFeedbackForm, contains, expect, test } from '../support/test'

test.describe('When course has only one enrolled student', () => {
  let fbtId: number

  test.beforeEach(async ({ api }) => {
    await api.createFeedbackTarget({})
    await api.setFeedbackActive()
    fbtId = await api.getTestFbtId()
  })

  test.describe('After logging in and opening feedback survey', () => {
    test.beforeEach(async ({ page, loginAs }) => {
      await loginAs(student)
      await page.locator('[data-cy="navbar-link-My feedback"]').click()
      await page.locator('[data-cy=feedback-item-give-feedback]').click()
    })

    test('Student gets a warning about small course when opening the feedback form', async ({ page }) => {
      await expect(contains(page, 'Attention!')).toBeAttached()
    })

    test('Student can cancel giving feedback and is redirected to My feedback page', async ({ page }) => {
      await page.locator('[data-cy=confirm-giving-feedback-dialog-cancel]').click()
      await expect(contains(page, 'Attention!')).not.toBeAttached()
      await expect(contains(page, 'Awaiting')).toBeAttached()
      await expect(page.locator('[data-cy=feedback-item-give-feedback]')).toBeAttached()
    })

    test('Student can close the warning and continue to feedback form after reading the warning', async ({ page }) => {
      await page.locator('[data-cy=confirm-giving-feedback-dialog-give-feedback]').click()
      await expect(contains(page, 'Attention!')).not.toBeAttached()
      await expect(contains(page, 'Test question 1 *')).toBeAttached()
    })
  })

  test.describe('After answering feedback questions', () => {
    test.beforeEach(async ({ page, api, loginAs }) => {
      await loginAs(student)
      await page.goto(`/targets/${fbtId}`)
      await page.locator('[data-cy=confirm-giving-feedback-dialog-give-feedback]').click()
      await answerFeedbackForm(page, api)
    })

    test('Give feedback button should only be enabled when consent box is checked', async ({ page }) => {
      const giveFeedback = page.locator('[data-cy=feedback-view-give-feedback]')
      const consent = page.locator('[data-cy=feedback-view-consent-checkbox]')

      await expect(giveFeedback).toBeDisabled()
      await consent.click()
      await expect(consent).toHaveClass(/Mui-checked/)
      await expect(giveFeedback).toBeEnabled()
      await consent.click()
      await expect(consent).not.toHaveClass(/Mui-checked/)
      await expect(giveFeedback).toBeDisabled()
    })

    test('Feedback can be submitted after checking the consent box', async ({ page }) => {
      await page.locator('[data-cy=feedback-view-consent-checkbox]').click()
      await page.locator('[data-cy=feedback-view-give-feedback]').click()
      await expect(contains(page, 'Feedback has been given. Thank you for your feedback!')).toBeAttached()
    })

    test.describe('After submitting feedback', () => {
      test.beforeEach(async ({ page }) => {
        await page.locator('[data-cy=feedback-view-consent-checkbox]').click()
        await page.locator('[data-cy=feedback-view-give-feedback]').click()
      })

      test('Student should not see feedback results', async ({ page }) => {
        await expect(
          contains(
            page,
            'Survey results are not shown when there are fewer than 5 enrolled students. ' +
              'The teacher can see the feedback if the student has given their consent.'
          )
        ).toBeAttached()
        await expect(contains(page, 'Multiple choice questions')).not.toBeAttached()
      })

      test('Teacher should see feedback results', async ({ page, loginAs }) => {
        await expect(contains(page, 'Feedback has been given. Thank you for your feedback!')).toBeAttached()
        await loginAs(teacher)
        await page.goto(`/targets/${fbtId}/results`)
        await expect(contains(page, 'Multiple choice questions')).toBeAttached()
        await expect(contains(page, 'Test question 1')).toBeAttached()
      })
    })
  })
})
