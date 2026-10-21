import { byDataCy } from '../../support/test'
import { expect, manualTest } from '../fixtures'
import { openFromMyTeaching } from '../steps'
import { teacher } from '../users'

manualTest(
  'Vastausten näkyvyyden muuttaminen',
  { annotation: { type: 'en', description: 'Changing who sees the answers' } },
  async ({ page, demo, loginAs, caption, click, scrollTo, pause, t }) => {
    await demo.seed('feedbackClosed', { feedback: true })
    const fbtId = demo.fbtId
    await loginAs(teacher)

    await caption({
      fi: 'Tässä videossa muutetaan avoimen kysymyksen vastaukset julkisiksi.',
      en: 'In this video, we make the answers to an open question public.',
    })

    await caption({
      fi: 'Julkisten kysymysten vastaukset näkevät myös kurssin opiskelijat ja muut opettajat. Avoimet kysymykset eivät ole oletuksena julkisia.',
      en: "The answers to public questions can also be seen by the course's students and other teachers. Open questions are not public by default.",
    })
    await openFromMyTeaching(page, click, caption, fbtId, 'ended')

    await caption({ fi: 'Avataan Vastaukset-välilehti.', en: 'Open the Answers tab.' })
    await click(byDataCy(page, 'feedback-target-results-tab'))

    const openQuestions = page.locator('[data-cy^="feedback-target-results-open-questions"]').first()
    const notPublic = openQuestions.getByRole('button', { name: new RegExp(`^${t('common:notPublic')}:`) }).first()
    await caption({
      fi: 'Jokaisen kysymyksen yläpuolella näkyy, onko se julkinen. Avataan avoimen kysymyksen valinta.',
      en: 'Above each question, you can see whether it is public. Open the setting of the open question.',
    })
    await scrollTo(openQuestions)
    await click(notPublic)

    await caption({
      fi: 'Avoimen kysymyksen voi tehdä julkiseksi vasta kyselyn sulkeuduttua, sillä vastauksissa voi olla henkilötietoja. Lue vastaukset siis ensin.',
      en: 'An open question can only be made public after the survey has closed, as the answers may contain personal data. So read the answers first.',
    })
    await pause(1000)

    await caption({
      fi: 'Valitaan, että vastaukset näkyvät kurssin opiskelijoille.',
      en: "Choose that the answers are visible to the course's students.",
    })
    // The browser's own confirmation isn't in the recording
    await click(page.getByRole('radio', { name: t('common:publicInfo') }))
    await page.keyboard.press('Escape')
    await expect(
      openQuestions.getByRole('button', { name: new RegExp(`^${t('common:public')}:`) }).first()
    ).toBeVisible()

    await caption({
      fi: 'Valmista! Kysymys on nyt julkinen, ja muutos tallentui heti.',
      en: 'Done! The question is now public, and the change was saved at once.',
    })
  }
)
