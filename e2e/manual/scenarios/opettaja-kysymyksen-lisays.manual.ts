import { byDataCy } from '../../support/test'
import { expect, manualTest } from '../fixtures'
import { openFromMyTeaching } from '../steps'
import { teacher } from '../users'

manualTest('Opettaja lisää kyselyyn oman kysymyksen', async ({ page, demo, lang, loginAs, caption, click, fill }) => {
  await demo.seed('ongoing')
  const fbtId = demo.fbtId
  await loginAs(teacher)

  await caption({ fi: 'Tässä videossa lisätään kurssin palautekyselyyn opettajan oma kysymys.' })

  await openFromMyTeaching(page, click, caption, fbtId, 'active')

  await caption({ fi: 'Kysymyksiä muokataan Kysymykset-välilehdellä.' })
  await click(byDataCy(page, 'feedback-target-settings-tab'))

  await caption({ fi: 'Lisätään uusi kysymys.' })
  await click(byDataCy(page, 'question-editor-add-question'))

  await caption({ fi: 'Valitaan kysymyksen tyypiksi asteikkokysymys.' })
  await click(byDataCy(page, 'question-editor-type-menu-select-likert'))

  await caption({ fi: 'Kirjoitetaan kysymys.' })
  await fill(page.locator(`input[id^=likert-label-${lang}-questions]`), 'Kuinka hyödyllisiä harjoitustehtävät olivat?')

  await caption({ fi: 'Kirjoitetaan kysymykselle kuvaus.' })
  await fill(
    page.locator(`input[id^=likert-description-${lang}-questions]`),
    'Arvioi harjoitustehtävien hyötyä oppimisellesi.'
  )

  await caption({ fi: 'Tallennetaan kysymys.' })
  await click(byDataCy(page, 'question-card-save-edit'))
  await expect(byDataCy(page, 'editQuestion').first()).toBeVisible()

  await caption({ fi: 'Valmista! Kysymys näkyy nyt opiskelijoille palautelomakkeella.' })
})
