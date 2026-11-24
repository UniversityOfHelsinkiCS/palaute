import { byDataCy, textField } from '../../support/test'
import { expect, manualTest } from '../fixtures'
import { openFromMyTeaching } from '../steps'
import { teacher } from '../users'

const GROUPS = [
  { fi: 'Maanantain harjoitusryhmä', sv: 'Måndagens övningsgrupp', en: 'Monday exercise group' },
  { fi: 'Torstain harjoitusryhmä', sv: 'Torsdagens övningsgrupp', en: 'Thursday exercise group' },
]

manualTest(
  'Ryhmittelykysymyksen lisääminen',
  {
    annotation: [
      { type: 'sv', description: 'Lägga till en grupperingsfråga' },
      { type: 'en', description: 'Adding a grouping question' },
    ],
  },
  async ({ page, demo, loginAs, caption, click, fill, t }) => {
    await demo.seed('ongoing')
    const fbtId = demo.fbtId
    await loginAs(teacher)

    await caption({
      fi: 'Tässä videossa lisätään kyselyyn ryhmittelykysymys, jotta vastauksia voi tarkastella ryhmittäin.',
      sv: 'I den här videon lägger vi till en grupperingsfråga i en enkät, så att svaren kan granskas per grupp.',
      en: 'In this video, we add a grouping question to a survey, so the answers can be viewed by group.',
    })

    await caption({
      fi: 'Jos kurssin opetusryhmät ovat Sisussa, Norppa tunnistaa ne suoraan ja voit ottaa ne käyttöön. Voit myös luoda täysin omat ryhmät ryhmittelykysymyksellä.',
      sv: 'Om kursens undervisningsgrupper finns i Sisu känner Norppa igen dem och du kan ta dem i bruk. Du kan också skapa helt egna grupper med en grupperingsfråga.',
      en: "If the course's teaching groups are in Sisu, Norppa recognises them and you can take them into use. You can also create groups of your own with a grouping question.",
    })
    await openFromMyTeaching(page, click, caption, fbtId, 'active')

    await caption({
      fi: 'Avataan Kysely-välilehden alta Muokkaa kysymyksiä -välilehti.',
      sv: 'Öppna fliken Redigera frågor under fliken Enkäten.',
      en: 'Open the Edit questions tab under the Survey tab.',
    })
    await click(byDataCy(page, 'feedback-target-settings-tab'))

    await caption({
      fi: 'Valitaan Lisää ryhmittelykysymys.',
      sv: 'Välj Lägg till grupperingsfråga.',
      en: 'Choose Add grouping question.',
    })
    await click(page.getByRole('button', { name: t('groups:addGroupingQuestion') }))
    const dialog = page.getByRole('dialog', { name: t('groups:addGroupingQuestion') })

    await caption({
      fi: 'Lisätään kysymykselle vaihtoehdoiksi kurssin ryhmät.',
      sv: 'Lägg till kursens grupper som frågans alternativ.',
      en: "Add the course's groups as the question's options.",
    })
    for (const [index, group] of GROUPS.entries()) {
      await click(dialog.getByRole('button', { name: t('questionEditor:addOption') }))
      for (const language of ['fi', 'sv', 'en'] as const) {
        await fill(textField(page, `option-editor-new-option-${language}-name.${index}`), group[language])
      }
    }

    await caption({
      fi: 'Tallennetaan. Ryhmittelykysymys on opiskelijalle pakollinen ja aina ensimmäisenä.',
      sv: 'Spara. Grupperingsfrågan är obligatorisk för studerandena och kommer alltid först.',
      en: 'Save. The grouping question is required, and students always see it first.',
    })
    await click(dialog.getByRole('button', { name: t('common:save') }))
    await expect(dialog).toBeHidden()

    await caption({
      fi: 'Valmista! Jotta yksittäistä vastaajaa ei voi tunnistaa, vastaukset näytetään ryhmittäin vain, jos jokaisessa vastauksia saaneessa ryhmässä on vähintään viisi vastaajaa.',
      sv: 'Klart! För att ingen enskild svarande ska kunna identifieras visas svaren per grupp bara om varje grupp som har fått svar har minst fem svarande.',
      en: 'Done! So that no single respondent can be identified, answers are shown by group only if every group with answers has at least five respondents.',
    })
  }
)
