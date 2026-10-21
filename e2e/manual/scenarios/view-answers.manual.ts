import { byDataCy, contains } from '../../support/test'
import { expect, manualTest } from '../fixtures'
import { openFromMyTeaching } from '../steps'
import { teacher } from '../users'

manualTest(
  'Vastausten katsominen',
  { annotation: { type: 'en', description: 'Viewing the answers' } },
  async ({ page, demo, loginAs, caption, hover, click, scrollTo, pause, t }) => {
    await demo.seed('feedbackOpen', { feedback: true })
    const fbtId = demo.fbtId
    await loginAs(teacher)

    await caption({
      fi: 'Tässä videossa katsotaan kyselyn vastauksia.',
      en: "In this video, we look at a survey's answers.",
    })

    await caption({
      fi: 'Vastaukset näkyvät ensimmäisestä vastauksesta lähtien, joten niitä voi seurata jo kyselyn ollessa auki.',
      en: 'The answers show from the first one on, so you can follow them while the survey is still open.',
    })
    await openFromMyTeaching(page, click, caption, fbtId, 'active')

    await caption({ fi: 'Avataan Vastaukset-välilehti.', en: 'Open the Answers tab.' })
    await click(byDataCy(page, 'feedback-target-results-tab'))

    await caption({
      fi: 'Ylimpänä on vastausten kertymä päivittäin osuutena kyselyn opiskelijoista.',
      en: "At the top is the daily total of answers, as a share of the survey's students.",
    })
    await hover(byDataCy(page, 'feedback-target-results-feedback-chart'))
    await pause(1500)

    const multipleChoice = page.locator('[data-cy^="feedback-target-results-multiple-choice-questions"]')
    await caption({
      fi: 'Asteikko- ja valintakysymysten vastausjakaumat näytetään kaavioina. Keskiarvoon ei lasketa eos-vastauksia.',
      en: 'The scale and choice questions show how the answers are spread, as charts. The average leaves out N/A answers.',
    })
    await hover(multipleChoice.first())
    await pause(1500)

    await caption({ fi: 'Kaaviot voi näyttää myös taulukkoina.', en: 'The charts can also be shown as tables.' })
    await click(page.getByRole('button', { name: new RegExp(`^${t('feedbackTargetResults:tableView')}`) }))
    await pause(1500)

    await caption({
      fi: 'Avointen kysymysten vastaukset ovat sivun lopussa aakkosjärjestyksessä.',
      en: 'The answers to open questions are at the end of the page, in alphabetical order.',
    })
    await scrollTo(page.locator('[data-cy^="feedback-target-results-open-questions"]').first())
    await expect(contains(page, 'Hyvä ja selkeä kurssi, kiitos!')).toBeVisible()
    await pause(1500)

    await caption({
      fi: 'Valmista! Uudet vastaukset tulevat näkyviin, kun lataat sivun uudelleen.',
      en: 'Done! New answers show when you reload the page.',
    })
  }
)
