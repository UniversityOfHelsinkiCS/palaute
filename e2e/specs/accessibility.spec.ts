import AxeBuilder from '@axe-core/playwright'

import { student } from '../fixtures/headers'
import { contains, expect, test } from '../support/test'

type Violations = Awaited<ReturnType<AxeBuilder['analyze']>>['violations']

const logViolations = (violations: Violations) => {
  console.log(`Number of detected accessibility violations: ${violations.length}`)

  const violationData = violations.map(v => {
    const { nodes, ...dataToLog } = v
    const affectedNodeCount = nodes.length
    return { ...dataToLog, affectedNodeCount }
  })
  console.log(violationData)
}

test.describe('In accessibility testing', () => {
  test.beforeEach(async ({ page, api, loginAs }) => {
    await api.createFeedbackTarget({ extraStudents: 5 })
    await api.setFeedbackActive()
    const id = await api.getTestFbtId()
    await loginAs(student)
    await page.goto(`/targets/${id}`)
  })

  test('Empty feedback form does not have accessibility issues', async ({ page }) => {
    await expect(
      contains(
        page,
        'Your name will not be shown to the teacher with your feedback. Fields marked with an asterisk (*) are required.'
      )
    ).toBeAttached()
    const { violations } = await new AxeBuilder({ page }).analyze()
    if (violations.length > 0) logViolations(violations)
    expect(violations).toEqual([])
  })
})
