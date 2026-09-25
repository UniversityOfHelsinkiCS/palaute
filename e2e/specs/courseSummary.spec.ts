import * as XLSX from 'xlsx'

import { summaryUser } from '../fixtures/headers'
import { contains, expect, test } from '../support/test'

const readXLSX = (filePath: string) => {
  const workbook = XLSX.readFile(filePath)
  return Object.fromEntries(
    workbook.SheetNames.map(sheetName => [sheetName, XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])])
  )
}

// For test data, see src/server/services/testServices/initSummary.js
test.describe('Course summary', () => {
  test.beforeEach(async ({ page, api, loginAs }) => {
    await api.initSummary(summaryUser)
    await loginAs(summaryUser)
    await page.goto(`/course-summary`)
  })

  test('Should have data in My Organisations and my courses', async ({ page }) => {
    await page.locator('[data-cy=my-organisations]').click()

    await expect(contains(page, 'TEST_SUMMARY_ORG')).toBeAttached({ timeout: 12_000 })
    await expect(contains(page, 'SUMMARY_TEST_COURSE')).toBeAttached()
    await expect(contains(page, '5.00')).toBeAttached()
    await expect(contains(page, '2 / 2')).toBeAttached()
    await expect(contains(page, '100%')).toBeAttached()

    await page.locator('[data-cy=my-courses]').click()

    await expect(contains(page, 'TEST_SUMMARY_ORG')).toBeAttached()
    await expect(contains(page, 'SUMMARY_TEST_COURSE')).toBeAttached()
    await expect(contains(page, '5.00')).toBeAttached()
    await expect(contains(page, '2 / 2')).toBeAttached()
    await expect(contains(page, '100%')).toBeAttached()
  })

  test('Organisation summary XLSX download works and has correct data', async ({ page }) => {
    await page.goto('/organisations/TEST_SUMMARY_ORG/summary')

    await contains(page, 'Download XLSX').click()
    const downloadPromise = page.waitForEvent('download')
    await page.locator('[data-cy=export-xlsx-submit]').click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(/\.xlsx$/)

    const jsonData = readXLSX(await download.path())
    expect(jsonData.organisations).toHaveLength(1)
    expect(jsonData.organisations[0]).toMatchObject({
      'Organisation code': 'TEST_SUMMARY_ORG',
      'Test question 1': 5,
      'Feedback count': 2,
    })
  })
})
