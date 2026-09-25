import type { Page } from '@playwright/test'

import type { Api, FeedbackTarget } from '../support/api'

import { student, teacher, admin } from '../fixtures/headers'
import { addSurveyQuestions, byDataCy, contains, expect, test, textField } from '../support/test'

const createInterimFeedback = async (api: Api, parentId: number) => {
  const today = new Date()
  return api.createInterimFeedback(parentId, {
    name: { fi: 'Testi välipalaute', en: 'Test interim feedback', sv: '' },
    startDate: today,
    endDate: new Date().setDate(today.getDate() + 7),
  })
}

const expectInterimFeedbackItem = async (page: Page, id: number, feedbackCount = '0/6') => {
  await expect(byDataCy(page, `interim-feedback-item-title-${id}`)).toBeAttached()
  await expect(byDataCy(page, `interim-feedback-not-open-${id}`)).not.toBeAttached()
  await expect(byDataCy(page, `interim-feedback-open-${id}`)).toBeAttached()
  await expect(byDataCy(page, `interim-feedback-period-info-${id}`)).toBeAttached()
  await expect(byDataCy(page, `interim-feedback-feedback-count-${id}`)).toBeAttached()
  await expect(byDataCy(page, `interim-feedback-feedback-count-percentage-${id}`)).toContainText(feedbackCount)

  const responsiblePersons = page.locator(`[data-cy="interim-feedback-responsible-persons-${id}"] > .MuiChip-root`)
  await expect(responsiblePersons).toHaveCount(1)
  await expect(responsiblePersons).toContainText('Tommi Testaaja')
}

const expectTeacherActions = async (page: Page, id: number) => {
  await expect(byDataCy(page, `interim-feedback-show-feedback-${id}`)).toBeAttached()
  await expect(byDataCy(page, `interim-feedback-show-results-${id}`)).not.toBeAttached()
  await expect(byDataCy(page, `interim-feedback-delete-${id}`)).toBeAttached()
}

const deleteInterimFeedback = async (page: Page, id: number) => {
  const confirmMessages: string[] = []
  page.on('dialog', dialog => confirmMessages.push(dialog.message()))

  await byDataCy(page, `interim-feedback-delete-${id}`).click()
  await expect(byDataCy(page, `interim-feedback-item-title-${id}`)).not.toBeAttached()

  expect(confirmMessages).toHaveLength(1)
  expect([
    'Are you sure you want to remove this interim feedback?',
    'Haluatko varmasti poistaa tämän välipalautteen?',
  ]).toContain(confirmMessages[0])
}

const openInterimFeedbackFromCourses = async (page: Page, parentId: number) => {
  await page.goto(`/courses`)
  await expect(byDataCy(page, 'my-teaching-course-unit-item-TEST_COURSE')).toBeAttached()
  await byDataCy(page, `my-teaching-feedback-target-item-link-${parentId}`).click()
  await byDataCy(page, 'feedback-target-interim-feedback-tab').click()
  await expect(byDataCy(page, 'interim-feedbacks-no-surveys-alert')).not.toBeAttached()
}

test.describe('Responsible Teachers', () => {
  let parentId: number
  let interimFeedback: FeedbackTarget

  test.beforeEach(async ({ api, loginAs }) => {
    await api.createFeedbackTarget({ extraStudents: 5 })
    await api.setFeedbackActive()
    parentId = await api.getTestFbtId()
    interimFeedback = await createInterimFeedback(api, parentId)
    await loginAs(teacher)
  })

  test('can fill in new interim feedbacks', async ({ page }) => {
    await openInterimFeedbackFromCourses(page, parentId)
    await byDataCy(page, 'interim-feedbacks-add-new').click()

    await expect(byDataCy(page, 'interim-feedback-editor-title')).toBeAttached()
    await expect(byDataCy(page, 'interim-feedback-editor-save')).toBeAttached()
    await expect(byDataCy(page, 'interim-feedback-editor-cancel')).toBeAttached()

    await textField(page, 'formik-locales-field-fi-name').fill('Uusi välipalaute')
    await textField(page, 'formik-locales-field-sv-name').fill('New interim feedback')
    await textField(page, 'formik-locales-field-en-name').fill('New interim feedback')

    await expect(byDataCy(page, 'formik-date-picker-field-startDate')).toBeVisible()
    await expect(byDataCy(page, 'formik-date-picker-field-endDate')).toBeVisible()

    await byDataCy(page, 'interim-feedback-editor-save').click()
    await expect(byDataCy(page, 'interim-feedback-editor-title')).not.toBeAttached()

    await page.goto(`/targets/${parentId}/interim-feedback`)
    await expectInterimFeedbackItem(page, interimFeedback.id)
    await expectTeacherActions(page, interimFeedback.id)
  })

  test('can view my teaching interim feedbacks if responsible teacher', async ({ page }) => {
    await openInterimFeedbackFromCourses(page, parentId)
    await expectInterimFeedbackItem(page, interimFeedback.id)
    await expectTeacherActions(page, interimFeedback.id)

    await byDataCy(page, `interim-feedback-show-feedback-${interimFeedback.id}`).click()
    await expect(page).toHaveURL(/\/feedback/)

    // Feedback information
    await expect(byDataCy(page, 'interim-feedback-target-primary-course-name')).toBeAttached()
    await expect(byDataCy(page, 'interim-feedback-target-secondary-course-name')).toBeAttached()
    await expect(byDataCy(page, 'interim-feedback-target-feedback-dates')).toBeAttached()
    await expect(byDataCy(page, 'feedback-target-edit-interim-feedback')).toBeAttached()
    await expect(byDataCy(page, 'interim-feedback-target-feedback-count')).toBeAttached()
    await expect(byDataCy(page, 'interim-feedback-target-feedback-count-percentage')).toContainText('0/6')

    // Teacher lists
    await expect(byDataCy(page, 'interim-feedback-target-responsible-administrative-person-list')).not.toBeAttached()
    await expect(byDataCy(page, 'interim-feedback-target-responsible-teacher-list')).toBeAttached()
    await expect(byDataCy(page, 'interim-feedback-target-teacher-list')).not.toBeAttached()

    // Links
    await expect(byDataCy(page, 'interim-feedback-target-copy-student-link')).toBeAttached()
    await expect(byDataCy(page, 'interim-feedback-target-organisation-link')).not.toBeAttached()
    await expect(byDataCy(page, 'interim-feedback-target-course-summary-link')).not.toBeAttached()
    await expect(byDataCy(page, 'interim-feedback-target-course-page-link')).not.toBeAttached()
    await expect(byDataCy(page, 'interim-feedback-target-wiki-link')).toBeAttached()
    await expect(byDataCy(page, 'interim-feedback-target-sisu-page-link')).not.toBeAttached()
    await expect(byDataCy(page, 'interim-feedback-target-interim-feedback-parent-link')).toBeAttached()

    // Tabs
    await byDataCy(page, 'interim-feedback-target-give-feedback-tab').click()
    await expect(
      page
        .locator('[aria-label="Questions tab disabled: Survey can no longer be edited after the feedback has opened."]')
        .first()
    ).toBeAttached()
    await byDataCy(page, 'interim-feedback-target-share-feedback-tab').click()
    await byDataCy(page, 'interim-feedback-target-results-tab').click()
    await byDataCy(page, 'interim-feedback-target-students-with-feedback-tab').click()
  })

  test('can edit interim feedbacks', async ({ page }) => {
    await page.goto(`/targets/${parentId}/interim-feedback`)
    await expectInterimFeedbackItem(page, interimFeedback.id)
    await expectTeacherActions(page, interimFeedback.id)

    await byDataCy(page, `interim-feedback-show-feedback-${interimFeedback.id}`).click()
    await byDataCy(page, 'feedback-target-edit-interim-feedback').click()

    await textField(page, 'formik-locales-field-fi-name').fill('New interim feedback')
    await textField(page, 'formik-locales-field-sv-name').fill('New interim feedback')
    await textField(page, 'formik-locales-field-en-name').fill('New interim feedback')
    await byDataCy(page, 'interim-feedback-editor-save').click()
    await byDataCy(page, 'interim-feedback-modal-close-button').click()

    await expect(byDataCy(page, `interim-feedback-item-title-${interimFeedback.id}`)).toContainText(
      'New interim feedback'
    )
    // Only the name changed
    await expectInterimFeedbackItem(page, interimFeedback.id)
    await expectTeacherActions(page, interimFeedback.id)

    // Can be deleted when no feedback has been given
    await deleteInterimFeedback(page, interimFeedback.id)
    await expect(byDataCy(page, 'interim-feedbacks-no-surveys-alert')).toBeAttached()
  })

  test('can not create/edit questions for ongoing interim feedback', async ({ page }) => {
    await page.goto(`/targets/${parentId}/interim-feedback`)
    await byDataCy(page, `interim-feedback-show-feedback-${interimFeedback.id}`).click()

    // The tab is not truly disabled so that its tooltip stays keyboard accessible
    await expect(
      page
        .locator('[aria-label="Questions tab disabled: Survey can no longer be edited after the feedback has opened."]')
        .first()
    ).toBeAttached()

    await expect(page.locator('[id="feedback-target-tabpanel-feedback"]')).toBeAttached()
    await byDataCy(page, 'interim-feedback-target-settings-tab').click()
    await expect(page.locator('[id="feedback-target-tabpanel-feedback"]')).toBeAttached()
    await expect(page.locator('[id="feedback-target-tabpanel-edit"]')).not.toBeAttached()
  })

  test('can create questions for interim feedbacks', async ({ page, api }) => {
    const today = new Date()
    const upcomingInterimFeedback = await api.createInterimFeedback(parentId, {
      name: { fi: 'Uusin välipalaute', en: 'Newest interim feedback', sv: '' },
      startDate: new Date().setDate(today.getDate() + 1),
      endDate: new Date().setDate(today.getDate() + 7),
    })

    await page.goto(`/targets/${upcomingInterimFeedback.id}`)
    await byDataCy(page, 'interim-feedback-target-settings-tab').click()
    await addSurveyQuestions(page)
  })
})

test.describe('Students', () => {
  let interimFeedback: FeedbackTarget

  test.beforeEach(async ({ api, loginAs }) => {
    await api.createFeedbackTarget({ extraStudents: 5 })
    interimFeedback = await createInterimFeedback(api, await api.getTestFbtId())
    await loginAs(student)
  })

  test('can view ongoing interim feedbacks and give interim feedback', async ({ page }) => {
    await page.goto(`/feedbacks`)
    await byDataCy(page, `feedback-item-${interimFeedback.id}`).click()
    await byDataCy(page, 'feedback-item-give-feedback').click()

    await expect(byDataCy(page, 'feedback-target-edit-interim-feedback')).not.toBeAttached()

    await byDataCy(page, 'interim-feedback-target-give-feedback-tab').click()
    await expect(byDataCy(page, 'interim-feedback-target-results-tab')).not.toBeAttached()

    await byDataCy(page, 'feedback-view-give-feedback').click()
    await expect(contains(page, 'Feedback has been given. Thank you for your feedback!')).toBeAttached()

    // New tabs appear once feedback is given
    await expect(byDataCy(page, 'interim-feedback-target-edit-feedback-tab')).toBeAttached()
    await byDataCy(page, 'interim-feedback-target-results-tab').click()
    await expect(contains(page, 'Multiple choice questions')).toBeAttached()
    await expect(page).toHaveURL(/\/results/)

    // Edit answer
    await byDataCy(page, 'interim-feedback-target-edit-feedback-tab').click()
    await byDataCy(page, 'feedback-view-give-feedback').click()
    await expect(contains(page, 'Feedback has been given. Thank you for your feedback!')).toBeAttached()
    await expect(page).toHaveURL(/\/results/)

    await page.goto(`/feedbacks`)

    await byDataCy(page, 'my-feedbacks-waiting-tab').click()
    await expect(byDataCy(page, `feedback-item-${interimFeedback.id}`)).not.toBeAttached()
    await expect(byDataCy(page, 'my-feedbacks-no-feedbacks')).toBeAttached()

    await byDataCy(page, 'my-feedbacks-given-tab').click()
    await expect(byDataCy(page, `feedback-item-${interimFeedback.id}`)).toBeAttached()
    await expect(byDataCy(page, 'my-feedbacks-no-feedbacks')).not.toBeAttached()
  })
})

test.describe('Admin Users', () => {
  let parentId: number
  let interimFeedback: FeedbackTarget

  test.beforeEach(async ({ api, loginAs }) => {
    await api.createFeedbackTarget({ extraStudents: 5 })
    parentId = await api.getTestFbtId()
    interimFeedback = await createInterimFeedback(api, parentId)
    await loginAs(admin)
  })

  test('can create questions for interim feedbacks regardles of ongoing feedback', async ({ page }) => {
    await page.goto(`/targets/${interimFeedback.id}`)
    await byDataCy(page, 'interim-feedback-target-settings-tab').click()
    await addSurveyQuestions(page)
  })

  test('can delete interim feedbacks after feedback has been given', async ({ page, api }) => {
    await api.giveInterimFeedback(interimFeedback, student)

    await page.goto(`/targets/${parentId}/interim-feedback`)
    await expect(byDataCy(page, 'interim-feedbacks-no-surveys-alert')).not.toBeAttached()

    await expect(byDataCy(page, `interim-feedback-item-title-${interimFeedback.id}`)).toBeAttached()
    await expect(byDataCy(page, `interim-feedback-open-${interimFeedback.id}`)).toBeAttached()
    await expect(byDataCy(page, `interim-feedback-period-info-${interimFeedback.id}`)).toBeAttached()
    await expect(byDataCy(page, `interim-feedback-feedback-count-${interimFeedback.id}`)).toBeAttached()
    await expect(byDataCy(page, `interim-feedback-feedback-count-percentage-${interimFeedback.id}`)).toContainText(
      '1/6'
    )
    const responsiblePersons = page.locator(
      `[data-cy="interim-feedback-responsible-persons-${interimFeedback.id}"] > .MuiChip-root`
    )
    await expect(responsiblePersons).toHaveCount(1)
    await expect(responsiblePersons).toContainText('Tommi Testaaja')

    await deleteInterimFeedback(page, interimFeedback.id)
    await expect(byDataCy(page, 'interim-feedbacks-no-surveys-alert')).toBeVisible()
  })
})
