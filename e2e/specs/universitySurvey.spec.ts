import { admin } from '../fixtures/headers'
import { contains, expect, test } from '../support/test'

test.describe('University Survey', () => {
  let fbtId: number

  test.beforeEach(async ({ api, loginAs }) => {
    await loginAs(admin)
    await api.createFeedbackTarget({ extraStudents: 5 })
    await api.setFeedbackActive()
    fbtId = await api.getTestFbtId()
  })

  test('Can be edited, and affects feedback form', async ({ page }) => {
    const questionTitle = 'How minttu was the course?'

    // Initially, the new university question is not visible
    await page.goto(`/targets/${fbtId}/feedback`)
    await expect(contains(page, questionTitle)).not.toBeAttached()

    // Go to the admin edit page and add a new university question
    await page.goto('/admin/misc')
    await contains(page, 'Edit university survey').click()
    await page.locator('[data-cy=question-editor-add-question]').click()
    await page.locator('[data-cy=question-editor-type-menu-select-likert]').click()
    // Text field id is likert-label-fi-questions.n
    await page.locator('[id^=likert-label-fi-questions]').last().fill(questionTitle)
    await page.locator('[data-cy=question-card-save-edit]').click()

    // Go back to the feedback form and check that the new question is now visible
    await page.goto(`/targets/${fbtId}/feedback`)
    await expect(contains(page, questionTitle)).toBeAttached()
  })
})
