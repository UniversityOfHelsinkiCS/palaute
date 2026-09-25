import type { Locator } from '@playwright/test'

import { addDays } from 'date-fns'

import { organisationCorrespondent } from '../fixtures/headers'
import { contains, expect, test } from '../support/test'

const append = async (locator: Locator, text: string) => locator.fill((await locator.inputValue()) + text)

test.describe('Organisation settings', () => {
  test.beforeEach(async ({ api, loginAs }) => {
    await api.createFeedbackTarget({ opensAt: addDays(new Date(), -1) })
    await api.seedTestOrgCorrespondent(organisationCorrespondent)
    await loginAs(organisationCorrespondent)
  })

  test.describe('Programme survey', () => {
    let confirmMessages: string[]

    test.beforeEach(async ({ page }) => {
      confirmMessages = []
      page.on('dialog', dialog => confirmMessages.push(dialog.message()))
      await page.goto(`/organisations/TEST_ORG/survey`)
    })

    test.afterEach(() => {
      for (const message of confirmMessages) {
        expect(message).toBe(
          'You are editing the questions shared by the whole programme. These questions are visible for all the courses of the programme. Are you sure you want to edit these questions?'
        )
      }
    })

    test('User with write access can ADD programme level questions', async ({ page }) => {
      await contains(page, 'Add textual content').click()
      await page.locator('textarea[id^=textual-context-text-en-questions]').fill('Test question programme level')
      await page.locator('[data-cy=question-card-save-edit]').click()

      await page.goto(`/organisations/TEST_ORG/survey`)
      await expect(contains(page, 'Test question programme level')).toBeAttached()
    })

    test('User with write access can EDIT programme level questions', async ({ page }) => {
      await contains(page, 'Add textual content').click()
      await page.locator('textarea[id^=textual-context-text-en-questions]').fill('Test question programme level')
      await page.locator('[data-cy=question-card-save-edit]').click()
      await expect(page.locator('[data-cy=editQuestion]').first()).toBeAttached()
      await page.reload()

      await page.locator('[data-cy=editQuestion]').first().click()
      await append(page.locator('textarea[id^=textual-context-text-en-questions]'), ' edited question')
      await page.locator('[data-cy=question-card-save-edit]').click()
      await page.goto(`/organisations/TEST_ORG/survey`)
      await expect(contains(page, 'edited question')).toBeAttached()
    })

    test('Edited programme level question appears in feedback target survey', async ({ page, api }) => {
      await contains(page, 'Add textual content').click()
      await page.locator('textarea[id^=textual-context-text-en-questions]').fill('Test question programme level')
      await page.locator('[data-cy=question-card-save-edit]').click()
      await expect(page.locator('[data-cy=editQuestion]').first()).toBeAttached()

      const id = await api.getTestFbtId()
      await page.goto(`/targets/${id}`)
      await expect(contains(page, 'Test question programme level')).toBeAttached()

      await page.goto(`/organisations/TEST_ORG/survey`)
      await page.locator('[data-cy=editQuestion]').first().click()
      await append(page.locator('textarea[id^=textual-context-text-en-questions]'), ' edited question')
      await page.locator('[data-cy=question-card-save-edit]').click()
      await page.goto(`/organisations/TEST_ORG/survey`)
      await expect(contains(page, 'edited question')).toBeAttached()

      await page.goto(`/targets/${id}`)
      await expect(contains(page, 'edited question')).toBeAttached()
    })

    test('New likert question appears in programmesummary', async ({ page }) => {
      await contains(page, 'Add question').click()
      await page.locator('[data-cy=question-editor-type-menu-select-likert]').click()
      await page.locator('input[id^=likert-label-en-questions]').fill('LIKERT TEST')
      await page.locator('[data-cy=question-card-save-edit]').click()
      await expect(page.locator('[data-cy=editQuestion]').first()).toBeAttached()

      await page.goto(`/organisations/TEST_ORG/summary`)
      await expect(contains(page, 'LIKERT TEST')).toBeAttached()
    })
  })
})
