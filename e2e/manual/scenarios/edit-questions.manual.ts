import { byDataCy } from '../../support/test'
import { expect, manualTest } from '../fixtures'
import { openFromMyTeaching } from '../steps'
import { teacher } from '../users'

const QUESTION = {
  fi: 'Kuinka hyödyllisiä harjoitustehtävät olivat?',
  sv: 'Hur nyttiga var övningsuppgifterna?',
  en: 'How useful were the exercises?',
}

const DESCRIPTION = {
  fi: '1 = ei lainkaan hyödyllisiä, 5 = erittäin hyödyllisiä',
  sv: '1 = inte alls nyttiga, 5 = mycket nyttiga',
  en: '1 = not useful at all, 5 = very useful',
}

manualTest(
  'Oman kysymyksen lisääminen',
  { annotation: { type: 'en', description: 'Adding your own question' } },
  async ({ page, demo, loginAs, caption, click, fill }) => {
    await demo.seed('ongoing')
    const fbtId = demo.fbtId
    await loginAs(teacher)

    await caption({
      fi: 'Tässä videossa lisätään kurssikyselyyn oma kysymys.',
      en: 'In this video, we add our own question to a course survey.',
    })

    await caption({
      fi: 'Omia kysymyksiä voi lisätä siihen asti, kun kysely avautuu.',
      en: 'You can add your own questions until the survey opens.',
    })
    await openFromMyTeaching(page, click, caption, fbtId, 'active')

    await caption({
      fi: 'Kysymyksiä muokataan Kysymykset-välilehdellä.',
      en: 'Questions are edited in the Questions tab.',
    })
    await click(byDataCy(page, 'feedback-target-settings-tab'))

    await caption({
      fi: 'Ylimpänä ovat yliopistotason kysymykset, joita ei voi muuttaa. Omat kysymykset lisätään niiden alle.',
      en: 'At the top are the university-wide questions, which cannot be changed. Your own questions go below them.',
    })
    await click(byDataCy(page, 'question-editor-add-question'))

    await caption({
      fi: 'Valitaan kysymyksen tyypiksi arvoasteikkokysymys.',
      en: 'Choose a scale of values question.',
    })
    await click(byDataCy(page, 'question-editor-type-menu-select-likert'))

    await caption({
      fi: 'Kirjoitetaan kysymys suomeksi, ruotsiksi ja englanniksi, sillä opiskelija näkee kyselyn omalla kielellään.',
      en: 'Write the question in Finnish, Swedish and English, as each student sees the survey in their own language.',
    })
    for (const language of ['fi', 'sv', 'en'] as const) {
      await fill(page.locator(`input[id^=likert-label-${language}-questions]`), QUESTION[language])
    }

    await caption({
      fi: 'Asteikon numeroilla ei ole selitteitä, joten kerrotaan kuvauksessa, mitä yksi ja viisi tarkoittavat.',
      en: 'The numbers of the scale have no labels, so say in the description what one and five mean.',
    })
    for (const language of ['fi', 'sv', 'en'] as const) {
      await fill(page.locator(`input[id^=likert-description-${language}-questions]`), DESCRIPTION[language])
    }

    await caption({
      fi: 'Tallennetaan kysymys. Muuta ei tarvitse tehdä: opiskelijat saavat ne kysymykset, jotka kyselyssä on sen avautuessa.',
      en: 'Save the question. Nothing else is needed: the students get the questions the survey has when it opens.',
    })
    await click(byDataCy(page, 'question-card-save-edit'))
    await expect(byDataCy(page, 'editQuestion').first()).toBeVisible()

    await caption({
      fi: 'Valmista! Kysymystä voi vielä muokata tai sen voi poistaa ennen kyselyn avautumista.',
      en: 'Done! You can still edit or remove the question before the survey opens.',
    })
  }
)
