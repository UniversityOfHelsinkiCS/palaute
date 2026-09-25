import type { Page } from '@playwright/test'

import { admin, student, teacher } from '../fixtures/headers'
import { contains, expect, test } from '../support/test'

const openEmailStats = async (page: Page) => {
  await page.goto(`/admin/misc`)
  await contains(page, 'Email statistics').click()
}

const addLikertQuestion = async (page: Page, title: string) => {
  await contains(page, 'Add question').click()
  await page.locator('[data-cy=question-editor-type-menu-select-likert]').click()
  await page.locator('input[id^=likert-label-en-questions]').fill(title)
  await page.locator('[data-cy=question-card-save-edit]').click()
  await expect(contains(page, title)).toBeAttached()
}

test.describe('Admin email stats view', () => {
  test.beforeEach(async ({ api }) => {
    await api.createFeedbackTarget()
  })

  test('shows 0 when no emails should be sent', async ({ page, api, loginAs }) => {
    await api.setFeedbackNotYetOpen()
    await loginAs(admin)
    await openEmailStats(page)
    await expect(contains(page, 'Student emails TODAY: 0')).toBeAttached()
    await expect(contains(page, 'Teacher emails TODAY: 0')).toBeAttached()
  })

  test('shows the email when feedback opening reminder to teacher email should be sent', async ({
    page,
    api,
    loginAs,
  }) => {
    // Opening in a week, so the email is sent today
    await api.setFeedbackOpeningSoon()
    await loginAs(admin)
    await openEmailStats(page)
    await expect(contains(page, 'Student emails TODAY: 0')).toBeAttached()
    await expect(contains(page, 'Teacher emails TODAY: 1')).toBeAttached()
    await expect(
      contains(page, 'Dear responsible teacher, welcome to the University of Helsinki Norppa course feedback system!')
    ).toBeAttached()
    await expect(contains(page, 'Test course realisation')).toBeAttached()
    await expect(contains(page, 'the following questions have been added to the survey:')).not.toBeAttached()
  })

  test('Custom questions teacher has added are shown in opening reminder', async ({ page, api, loginAs }) => {
    await api.setFeedbackOpeningSoon()

    await loginAs(teacher)
    const id = await api.getTestFbtId()
    await page.goto(`/targets/${id}/edit`)
    await addLikertQuestion(page, 'Minthu custom question')
    await addLikertQuestion(page, 'Soju custom question')

    await loginAs(admin)
    await openEmailStats(page)
    await expect(contains(page, 'Student emails TODAY: 0')).toBeAttached()
    await expect(contains(page, 'Teacher emails TODAY: 1')).toBeAttached()
    await expect(
      contains(page, 'Dear responsible teacher, welcome to the University of Helsinki Norppa course feedback system!')
    ).toBeAttached()
    await expect(contains(page, 'Test course realisation')).toBeAttached()
    await expect(contains(page, 'the following questions have been added to the survey:')).toBeAttached()
    await expect(contains(page, 'Minthu custom question')).toBeAttached()
    await expect(contains(page, 'Soju custom question')).toBeAttached()
  })

  test('shows the email when feedback opening student email should be sent', async ({ page, api, loginAs }) => {
    await api.setFeedbackActive()
    await loginAs(admin)
    await openEmailStats(page)
    await expect(contains(page, 'Student emails TODAY: 1')).toBeAttached()
    await expect(contains(page, 'Teacher emails TODAY: 0')).toBeAttached()
    await expect(contains(page, 'opiskelija@toska.fi')).toBeAttached()
    await expect(contains(page, 'now open: Test course realisation')).toBeAttached()
  })

  test('shows the email when feedback response reminder should be sent', async ({ page, api, loginAs }) => {
    await loginAs(admin)
    await api.setFeedbackActive()
    await api.giveFeedback(student)
    await api.setFeedbackClosed()
    await openEmailStats(page)
    await expect(contains(page, 'Student emails TODAY: 0')).toBeAttached()
    await expect(contains(page, /Teacher emails TODAY: [^0]/)).toBeAttached()
    await expect(contains(page, 'Tommi.testaaja@toska.fi')).toBeAttached()
    await expect(contains(page, 'has ended: Testauskurssin toteutus')).toBeAttached()
  })

  test('allows to run email cronjob and result in success', async ({ page, loginAs }) => {
    await loginAs(admin)
    await page.goto(`/admin/misc`)
    await page.locator('[data-cy=run-pate]').click()
    await expect(contains(page, 'SUCCESS')).toBeAttached()
  })
})
