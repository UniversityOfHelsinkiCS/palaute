import { teacher } from '../../fixtures/headers'
import { byDataCy } from '../../support/test'
import { expect, manualTest } from '../fixtures'

manualTest('Opettaja lisää kyselyyn oman kysymyksen', async ({ page, api, lang, loginAs, caption, click, fill }) => {
  await api.createFeedbackTarget({ extraStudents: 5 })
  const fbtId = await api.getTestFbtId()
  await loginAs(teacher)

  await caption({ fi: 'Tässä videossa lisätään kurssin palautekyselyyn opettajan oma kysymys.' })

  await caption({ fi: 'Kurssi löytyy Kyselyni-sivulta päättyneiden kurssien alta.' })
  await click(byDataCy(page, 'navbar-links').locator('a[href="/courses"]'))
  await click(byDataCy(page, 'my-teaching-ended-tab'))
  await click(byDataCy(page, 'my-teaching-course-unit-accordion-TEST_COURSE'))

  await caption({ fi: 'Avataan kurssin palautekysely.' })
  await click(page.locator(`a[href*="/targets/${fbtId}"]`).first())

  await caption({ fi: 'Kysymyksiä muokataan Kysymykset-välilehdellä.' })
  await click(byDataCy(page, 'feedback-target-settings-tab'))

  await caption({ fi: 'Lisätään uusi kysymys ja valitaan tyypiksi asteikkokysymys.' })
  await click(byDataCy(page, 'question-editor-add-question'))
  await click(byDataCy(page, 'question-editor-type-menu-select-likert'))

  await caption({ fi: 'Kirjoitetaan kysymys ja sen kuvaus.' })
  await fill(page.locator(`input[id^=likert-label-${lang}-questions]`), 'Kuinka hyödyllisiä harjoitustehtävät olivat?')
  await fill(
    page.locator(`input[id^=likert-description-${lang}-questions]`),
    'Arvioi harjoitustehtävien hyötyä oppimisellesi.'
  )

  await caption({ fi: 'Tallennetaan kysymys.' })
  await click(byDataCy(page, 'question-card-save-edit'))
  await expect(byDataCy(page, 'editQuestion').first()).toBeVisible()

  await caption({ fi: 'Valmista! Kysymys näkyy nyt opiskelijoille palautelomakkeella.' })
})
