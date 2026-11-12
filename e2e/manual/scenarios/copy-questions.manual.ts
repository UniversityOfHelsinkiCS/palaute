import { byDataCy, contains } from '../../support/test'
import { COURSE_CODE } from '../demo'
import { expect, manualTest } from '../fixtures'
import { closeNotification, openFromMyTeaching } from '../steps'
import { teacher } from '../users'

manualTest(
  'Kysymysten kopioiminen toisesta kyselystä',
  { annotation: { type: 'en', description: 'Copying questions from another survey' } },
  async ({ page, demo, loginAs, caption, hover, click, scrollTo, pause, t, localize }) => {
    await demo.seed('ongoing')
    const fbtId = demo.fbtId
    await loginAs(teacher)

    await caption({
      fi: 'Tässä videossa kopioidaan omat kysymykset kurssin aiemmasta kyselystä.',
      en: "In this video, we copy our own questions from a course's earlier survey.",
    })

    await openFromMyTeaching(page, click, caption, fbtId, 'active')

    await caption({
      fi: 'Avataan Kysely-välilehden alta Muokkaa kysymyksiä -välilehti.',
      en: 'Open the Edit questions tab under the Survey tab.',
    })
    await click(byDataCy(page, 'feedback-target-settings-tab'))

    await caption({
      fi: 'Valitaan Kopioi kysymykset toisesta kyselystä.',
      en: 'Choose Copy questions from another survey.',
    })
    await click(page.getByRole('button', { name: t('editFeedbackTarget:copyFromCourseButton') }))
    const dialog = page.getByRole('dialog', { name: t('editFeedbackTarget:copyFromCourseDialogTitle') })

    await caption({
      fi: 'Valitaan kurssi. Listalla ovat kurssit, joita opetat.',
      en: 'Choose the course. The list has the courses you teach.',
    })
    await click(dialog.getByRole('combobox'))
    await click(page.getByRole('option', { name: new RegExp(COURSE_CODE) }))

    await caption({
      fi: 'Näkyviin tulevat toteutukset, joilla on omia kysymyksiä. Kysymykset näkyvät, kun viet hiiren toteutuksen päälle.',
      en: 'The realisations with their own questions are shown. Their questions show when you hover over a realisation.',
    })
    await hover(dialog.getByRole('link').first())
    await expect(page.getByRole('tooltip')).toBeVisible()
    await pause(2500)

    await caption({ fi: 'Kopioidaan kysymykset.', en: 'Copy the questions.' })
    await click(dialog.getByRole('button', { name: t('editFeedbackTarget:copyQuestionsButton') }).first())
    await closeNotification(page, click, t('editFeedbackTarget:copySuccessSnackbar'))
    await closeNotification(page, click, t('common:saveSuccess'))
    await expect(dialog).toBeHidden()

    await caption({
      fi: 'Kysymykset lisättiin omien kysymysten perään ja tallennettiin.',
      en: 'The questions were added after your own questions and saved.',
    })
    const copied = contains(
      page,
      localize({ fi: 'Kuinka hyödyllisiä harjoitustehtävät olivat?', en: 'How useful were the exercises?' })
    )
    await expect(copied).toBeVisible()
    await scrollTo(copied)

    await caption({
      fi: 'Valmista! Kopioidut kysymykset ovat oletuksena ei-julkisia, kunnes muutat ne julkisiksi.',
      en: 'Done! The copied questions are not public by default, until you make them public.',
    })
  }
)
