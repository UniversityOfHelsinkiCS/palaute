import { byDataCy } from '../../support/test'
import { expect, manualTest } from '../fixtures'
import { student } from '../users'

manualTest('Opiskelija antaa kurssipalautetta', async ({ page, api, demo, loginAs, caption, click, fill }) => {
  await demo.seed('feedbackOpen', { feedback: true })
  const questions = await api.getUniversityQuestions()
  const openQuestion = questions.find(q => q.type === 'OPEN')!
  await loginAs(student)

  await caption({ fi: 'Tässä videossa annetaan palautetta kurssista.' })

  await caption({ fi: 'Etusivulla näkyvät kurssit, joille voi antaa palautetta.' })

  await caption({ fi: 'Avataan kurssin palautelomake.' })
  await click(byDataCy(page, 'feedback-item-give-feedback'))

  await caption({ fi: 'Vastataan asteikkokysymyksiin valitsemalla sopiva vaihtoehto.' })
  const answers = page.locator('input[value="5"]')
  await expect(answers.first()).toBeVisible()
  for (const answer of await answers.all()) {
    await click(answer)
  }

  await caption({ fi: 'Arvioidaan vielä kurssin työmäärää suhteessa opintopisteisiin.' })
  await click(page.getByRole('radio', { name: 'sopiva', exact: true }))

  await caption({ fi: 'Avoimiin kysymyksiin voi kirjoittaa vapaasti.' })
  await fill(page.locator(`textarea[id="${openQuestion.id}-input"]`), 'Kurssi oli selkeä ja tehtävät hyödyllisiä.')

  await caption({ fi: 'Lähetetään palaute.' })
  await click(byDataCy(page, 'feedback-view-give-feedback'))
  await expect(byDataCy(page, 'feedback-target-results-tab')).toBeVisible()

  await caption({ fi: 'Kiitos! Palaute on annettu, ja kurssin palautteen yhteenveto näkyy nyt.' })
})
