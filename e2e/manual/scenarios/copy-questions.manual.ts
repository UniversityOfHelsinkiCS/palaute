import { byDataCy, contains } from '../../support/test'
import { COURSE_CODE } from '../demo'
import { expect, manualTest } from '../fixtures'
import { closeNotification, openFromMyTeaching } from '../steps'
import { teacher } from '../users'

manualTest(
  'Kysymysten kopioiminen toisesta kyselystä',
  {
    annotation: [
      { type: 'sv', description: 'Kopiera frågor från en annan enkät' },
      { type: 'en', description: 'Copying questions from another survey' },
    ],
  },
  async ({ page, demo, loginAs, caption, hover, click, scrollTo, pause, t, localize }) => {
    await demo.seed('ongoing')
    const fbtId = demo.fbtId
    await loginAs(teacher)

    await caption({
      fi: 'Tässä videossa kopioidaan omat kysymykset kurssin aiemmasta kyselystä.',
      sv: 'I den här videon kopierar vi våra egna frågor från en tidigare enkät på kursen.',
      en: "In this video, we copy our own questions from a course's earlier survey.",
    })

    await openFromMyTeaching(page, click, caption, fbtId, 'active')

    await caption({
      fi: 'Avataan Kysely-välilehden alta Muokkaa kysymyksiä -välilehti.',
      sv: 'Öppna fliken Redigera frågor under fliken Enkäten.',
      en: 'Open the Edit questions tab under the Survey tab.',
    })
    await click(byDataCy(page, 'feedback-target-settings-tab'))

    await caption({
      fi: 'Valitaan Kopioi kysymykset toisesta kyselystä.',
      sv: 'Välj Kopiera frågor från en annan enkät.',
      en: 'Choose Copy questions from another survey.',
    })
    await click(page.getByRole('button', { name: t('editFeedbackTarget:copyFromCourseButton') }))
    const dialog = page.getByRole('dialog', { name: t('editFeedbackTarget:copyFromCourseDialogTitle') })

    await caption({
      fi: 'Valitaan kurssi. Listalla ovat kurssit, joita opetat.',
      sv: 'Välj kursen. I listan finns de kurser som du undervisar på.',
      en: 'Choose the course. The list has the courses you teach.',
    })
    await click(dialog.getByRole('combobox'))
    await click(page.getByRole('option', { name: new RegExp(COURSE_CODE) }))

    await caption({
      fi: 'Näkyviin tulevat toteutukset, joilla on omia kysymyksiä. Kysymykset näkyvät, kun viet hiiren toteutuksen päälle.',
      sv: 'De genomföranden som har egna frågor visas. Frågorna syns när du för muspekaren över ett genomförande.',
      en: 'The realisations with their own questions are shown. Their questions show when you hover over a realisation.',
    })
    await hover(dialog.getByRole('link').first())
    await expect(page.getByRole('tooltip')).toBeVisible()
    await pause(2500)

    await caption({ fi: 'Kopioidaan kysymykset.', sv: 'Kopiera frågorna.', en: 'Copy the questions.' })
    await click(dialog.getByRole('button', { name: t('editFeedbackTarget:copyQuestionsButton') }).first())
    await closeNotification(page, click, t('editFeedbackTarget:copySuccessSnackbar'))
    await closeNotification(page, click, t('common:saveSuccess'))
    await expect(dialog).toBeHidden()

    await caption({
      fi: 'Kysymykset lisättiin omien kysymysten perään ja tallennettiin.',
      sv: 'Frågorna lades till efter dina egna frågor och sparades.',
      en: 'The questions were added after your own questions and saved.',
    })
    const copied = contains(
      page,
      localize({
        fi: 'Kuinka hyödyllisiä harjoitustehtävät olivat?',
        sv: 'Hur nyttiga var övningsuppgifterna?',
        en: 'How useful were the exercises?',
      })
    )
    await expect(copied).toBeVisible()
    await scrollTo(copied)

    await caption({
      fi: 'Valmista! Kopioidut kysymykset ovat oletuksena ei-julkisia, kunnes muutat ne julkisiksi.',
      sv: 'Klart! De kopierade frågorna är inte publika förrän du gör dem publika.',
      en: 'Done! The copied questions are not public by default, until you make them public.',
    })
  }
)
