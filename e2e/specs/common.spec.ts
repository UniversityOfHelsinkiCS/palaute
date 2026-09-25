import { admin, studentVeikko } from '../fixtures/headers'
import { contains, expect, test } from '../support/test'

test.describe('Common tests', () => {
  test('User can change language', async ({ page, loginAs }) => {
    await loginAs(studentVeikko)
    await expect(contains(page, 'My feedback')).toBeAttached()
    await contains(page, 'Testaaja').click()
    await contains(page, 'SV').click()
    await expect(contains(page, 'Mina responser')).toBeAttached()

    // The chosen language must also survive navigation
    await page.locator('[data-cy="navbar-link-Bläddra kurser"]').click()
    await expect(contains(page, 'Sök programmets kurser')).toBeAttached()

    await contains(page, 'Testaaja').click()
    await contains(page, 'FI').click()
    await expect(contains(page, 'Hae ohjelman opetusta')).toBeAttached()
  })
  test('CONFIG is populated correctly', async ({ page, loginAs }) => {
    await loginAs(admin)
    await page.goto(`/admin/users`)
    await expect(contains(page, 'HY-Minttujam')).toBeAttached()
    await expect(contains(page, 'Pahaminttu')).not.toBeAttached()
  })
  test('Custom translation override is loaded correctly', async ({ page, loginAs }) => {
    await loginAs(admin)
    await page.goto(`/admin/users`)
    await expect(contains(page, 'Illuminati-silmä')).toBeAttached()
  })
  test('Error view is shown when a component throws during render', async ({ page, loginAs }) => {
    await loginAs(admin)
    await page.goto(`/admin/`)
    await page.locator('[data-cy=errorButton]').click()
    await expect(page.locator('[data-cy=errorView]')).toBeAttached()
  })
})
