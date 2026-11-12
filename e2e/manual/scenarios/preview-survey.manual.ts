import { byDataCy } from '../../support/test'
import { expect, manualTest } from '../fixtures'
import { openFromMyTeaching } from '../steps'
import { teacher } from '../users'

manualTest(
  'Kyselyn esikatselu',
  { annotation: { type: 'en', description: 'Previewing the survey' } },
  async ({ page, demo, lang, loginAs, caption, hover, click, scrollTo, pause, t }) => {
    await demo.seed('ongoing')
    const fbtId = demo.fbtId
    await loginAs(teacher)

    await caption({
      fi: 'Tässä videossa katsotaan kyselyä opiskelijan silmin.',
      en: 'In this video, we see the survey as a student sees it.',
    })

    await openFromMyTeaching(page, click, caption, fbtId, 'active')

    const previewTab = byDataCy(page, 'feedback-target-give-feedback-tab')
    await expect(previewTab).toHaveAttribute('aria-selected', 'true')
    await caption({
      fi: 'Kyselyn sivu avautuu Esikatselu-välilehdelle.',
      en: "The survey's page opens on the Preview tab.",
    })
    await hover(previewTab)

    await caption({
      fi: 'Esikatselussa näkyy koko kysely siinä järjestyksessä kuin opiskelija sen näkee. Esikatselulomaketta ei voi lähettää.',
      en: 'The preview shows the whole survey in the order the student sees it. The preview form cannot be submitted.',
    })

    const language = page.getByRole('combobox', { name: t('feedbackView:translationLanguage') }).last()
    await scrollTo(language)

    await caption({
      fi: 'Opiskelija näkee kysymykset Sisussa määritellyllä asiointikielellään. Esikatselun kielen voi vaihtaa välilehden alareunan valikosta.',
      en: "Students see the questions in their own preferred language set in Sisu. The preview's language can be changed from the menu at the bottom of the tab.",
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
      fi: 'Sama kieli on käytössä myös Muokkaa kysymyksiä -välilehdellä, jossa myös kysymyseditorin kysymykset vaihtuvat valitulle kielelle.',
      en: 'The same language is used in the Edit questions tab, where the questions in the editor change to it too.',
    })
    await click(byDataCy(page, 'feedback-target-settings-tab'))
    await expect(byDataCy(page, 'question-editor-add-question')).toBeVisible()
    await scrollTo(page.getByRole('combobox', { name: t('editFeedbackTarget:translationLanguage') }).last())

    await caption({
      fi: 'Kysymysten muokkauksen ja esikatselun välillä voi siirtyä vaihtamalla välilehteä. Palataan Esikatselu-välilehdelle.',
      en: 'You can move between editing the questions and the preview by changing the tab. Go back to the Preview tab.',
    })
    await click(previewTab)
    await expect(previewTab).toHaveAttribute('aria-selected', 'true')

    await caption({
      fi: 'Valmista! Esikatselulla voit tarkistaa kyselyn ennen sen avautumista.',
      en: 'Done! With the preview, you can check the survey before it opens.',
    })
  }
)
