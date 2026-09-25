import { student } from '../fixtures/headers'
import { contains, expect, test } from '../support/test'

test.describe('Search page', () => {
  test.beforeEach(async ({ page, loginAs }) => {
    await loginAs(student)
    await page.goto('/search')
  })

  test('should have a working search bar with organisations but tkt has no courses in test data', async ({ page }) => {
    await page.locator('[data-cy=search-input]').click()
    await expect(contains(page, 'H50')).toBeAttached() // <-- Matlu
    const tkt = contains(page, '500-K005') // <-- Käpistely kandi

    await tkt.click()

    await expect(page.locator('[data-cy=no-courses-alert]')).toBeAttached()
  })
})
