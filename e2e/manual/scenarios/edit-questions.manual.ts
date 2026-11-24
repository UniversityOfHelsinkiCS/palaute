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
  {
    annotation: [
      { type: 'sv', description: 'Lägga till en egen fråga' },
      { type: 'en', description: 'Adding your own question' },
    ],
  },
  async ({ page, demo, loginAs, caption, click, fill }) => {
    await demo.seed('ongoing')
    const fbtId = demo.fbtId
    await loginAs(teacher)

    await caption({
      fi: 'Tässä videossa lisätään kurssikyselyyn oma kysymys.',
      sv: 'I den här videon lägger vi till en egen fråga i en kursenkät.',
      en: 'In this video, we add our own question to a course survey.',
    })

    await caption({
      fi: 'Omia kysymyksiä voi lisätä siihen asti, kun kysely avautuu.',
      sv: 'Du kan lägga till egna frågor tills enkäten öppnas.',
      en: 'You can add your own questions until the survey opens.',
    })
    await openFromMyTeaching(page, click, caption, fbtId, 'active')

    await caption({
      fi: 'Kysymyksiä muokataan Kysely-välilehden alla olevalla Muokkaa kysymyksiä -välilehdellä.',
      sv: 'Frågorna redigeras på fliken Redigera frågor under fliken Enkäten.',
      en: 'Questions are edited in the Edit questions tab under the Survey tab.',
    })
    await click(byDataCy(page, 'feedback-target-settings-tab'))

    await caption({
      fi: 'Ylimpänä ovat yliopistotason kysymykset, joita ei voi muuttaa. Omat kysymykset lisätään niiden alle.',
      sv: 'Överst finns frågorna på universitetsnivå, som inte kan ändras. Dina egna frågor läggs till under dem.',
      en: 'At the top are the university-wide questions, which cannot be changed. Your own questions go below them.',
    })
    await click(byDataCy(page, 'question-editor-add-question'))

    await caption({
      fi: 'Valitaan kysymyksen tyypiksi arvoasteikkokysymys.',
      sv: 'Välj frågetypen Värderingsskala.',
      en: 'Choose a scale of values question.',
    })
    await click(byDataCy(page, 'question-editor-type-menu-select-likert'))

    await caption({
      fi: 'Kirjoitetaan kysymys suomeksi, ruotsiksi ja englanniksi, sillä opiskelija näkee kysymyksen omalla, Sisussa määritellyllä asiointikielellään.',
      sv: 'Skriv frågan på finska, svenska och engelska, eftersom varje studerande ser frågan på sitt eget språk som har angetts i Sisu.',
      en: 'Write the question in Finnish, Swedish and English, as each student sees it in their own preferred language set in Sisu.',
    })
    for (const language of ['fi', 'sv', 'en'] as const) {
      await fill(page.locator(`input[id^=likert-label-${language}-questions]`), QUESTION[language])
    }

    await caption({
      fi: 'Asteikon numeroilla ei ole selitteitä, joten kerrotaan kuvauksessa, mitä yksi ja viisi tarkoittavat.',
      sv: 'Skalans siffror har inga förklaringar, så berätta i beskrivningen vad ett och fem betyder.',
      en: 'The numbers of the scale have no labels, so say in the description what one and five mean.',
    })
    for (const language of ['fi', 'sv', 'en'] as const) {
      await fill(page.locator(`input[id^=likert-description-${language}-questions]`), DESCRIPTION[language])
    }

    await caption({
      fi: 'Tallennetaan kysymys. Muuta ei tarvitse tehdä: opiskelijat saavat ne kysymykset, jotka kyselyssä on sen avautuessa.',
      sv: 'Spara frågan. Mer behöver du inte göra: studerandena får de frågor som enkäten har när den öppnas.',
      en: 'Save the question. Nothing else is needed: the students get the questions the survey has when it opens.',
    })
    await click(byDataCy(page, 'question-card-save-edit'))
    await expect(byDataCy(page, 'editQuestion').first()).toBeVisible()

    await caption({
      fi: 'Valmista! Kysymystä voi vielä muokata tai sen voi poistaa ennen kyselyn avautumista.',
      sv: 'Klart! Du kan ännu redigera eller ta bort frågan innan enkäten öppnas.',
      en: 'Done! You can still edit or remove the question before the survey opens.',
    })
  }
)
