import { byDataCy } from '../../support/test'
import { expect, manualTest } from '../fixtures'
import { openFromMyTeaching } from '../steps'
import { teacher } from '../users'

manualTest(
  'Kyselyn esikatselu',
  { annotation: { type: 'en', description: 'Previewing the survey' } },
  async ({ page, demo, lang, loginAs, caption, click, scrollTo, pause, t }) => {
    await demo.seed('ongoing')
    const fbtId = demo.fbtId
    await loginAs(teacher)

    await caption({
      fi: 'Tässä videossa katsotaan kyselyä opiskelijan silmin.',
      en: 'In this video, we see the survey as a student sees it.',
    })

    await openFromMyTeaching(page, click, caption, fbtId, 'active')

    await caption({
      fi: 'Avataan Kysymykset-välilehti.',
      en: 'Open the Questions tab.',
    })
    await click(byDataCy(page, 'feedback-target-settings-tab'))

    // The button and the menu are both above and below the questions
    const language = page.getByRole('combobox', { name: t('editFeedbackTarget:translationLanguage') }).last()
    await caption({
      fi: 'Opiskelija näkee kyselyn sillä kielellä, jolla hän käyttää Norppaa. Kieli valitaan kysymysten alta.',
      en: 'Students see the survey in the language they use Norppa in. The language is chosen below the questions.',
    })
    await click(language)

    await caption({
      fi: 'Valitaan englanti. Kysymykset vaihtuvat englanniksi.',
      en: 'Choose Finnish. The questions change to Finnish.',
    })
    // The options are Finnish, Swedish and English
    await click(page.getByRole('option').nth(lang === 'fi' ? 2 : 0))
    await pause(1500)

    await caption({
      fi: 'Valitaan Esikatsele kyselyä.',
      en: 'Choose Show survey preview.',
    })
    await click(page.getByRole('button', { name: t('editFeedbackTarget:showPreview') }).last())

    await caption({
      fi: 'Esikatselussa näkyy koko kysely siinä järjestyksessä kuin opiskelija sen näkee. Esikatselulomaketta ei voi lähettää.',
      en: 'The preview shows the whole survey in the order the student sees it. The preview form cannot be submitted.',
    })
    // The last one stays at the end of the form, the first floats until the end is on the screen
    const editSurvey = page.getByRole('link', { name: t('feedbackView:editSurvey') }).last()
    await scrollTo(editSurvey)

    await caption({
      fi: 'Muokkaa kyselyä -painikkeella pääsee takaisin muokkaamaan kysymyksiä.',
      en: 'Edit survey takes you back to editing the questions.',
    })
    await click(editSurvey)
    await expect(byDataCy(page, 'question-editor-add-question')).toBeVisible()

    await caption({
      fi: 'Valmista! Esikatselulla voit tarkistaa kyselyn ennen sen avautumista.',
      en: 'Done! With the preview, you can check the survey before it opens.',
    })
  }
)
