import { byDataCy } from '../../support/test'
import { expect, manualTest } from '../fixtures'
import { closeNotification, openFromMyTeaching } from '../steps'
import { teacher } from '../users'

const ANSWER = 'Luennoilla eteni välillä liian nopeasti.'

manualTest(
  'Avoimen vastauksen piilottaminen',
  { annotation: { type: 'en', description: 'Hiding an open answer' } },
  async ({ page, demo, loginAs, caption, click, scrollTo, t }) => {
    await demo.seed('feedbackClosed', { feedback: true })
    const fbtId = demo.fbtId
    await loginAs(teacher)

    await caption({
      fi: 'Tässä videossa piilotetaan avoin vastaus.',
      en: 'In this video, we hide an answer to an open question.',
    })

    await caption({
      fi: 'Jos vastauksessa on henkilötietoja, kuten opiskelijanumero, tai se on muuten asiaton, sen voi piilottaa.',
      en: 'If an answer contains personal data, like a student number, or is otherwise inappropriate, you can hide it.',
    })
    await openFromMyTeaching(page, click, caption, fbtId, 'ended')

    await caption({ fi: 'Avataan Vastaukset-välilehti.', en: 'Open the Answers tab.' })
    await click(byDataCy(page, 'feedback-target-results-tab'))

    // The innermost box with both the answer and its buttons
    const answer = page
      .locator('div')
      .filter({ hasText: ANSWER })
      .filter({ has: page.getByRole('button', { name: t('feedbackTargetResults:setHidden') }) })
      .last()
    await caption({
      fi: 'Etsitään vastaus avoimista kysymyksistä.',
      en: 'Find the answer under the open questions.',
    })
    await scrollTo(answer)

    await caption({
      fi: 'Piilotetaan vastaus sen vieressä olevasta silmäkuvakkeesta.',
      en: 'Hide the answer with the eye icon next to it.',
    })
    await click(answer.getByRole('button', { name: t('feedbackTargetResults:setHidden') }))
    await closeNotification(page, click, new RegExp(ANSWER.slice(0, 10)))

    await caption({
      fi: 'Vastaus on piilotettu kaikilta, jotka näkevät vain julkiset vastaukset. Sinä näet sen edelleen piilotetuksi merkittynä.',
      en: 'The answer is hidden from everyone who sees only public answers. You still see it, marked as hidden.',
    })
    const unhide = answer.getByRole('button', { name: t('feedbackTargetResults:setVisible') })
    await expect(unhide).toBeVisible()

    await caption({
      fi: 'Valmista! Piilotuksen saa pois samasta kuvakkeesta.',
      en: 'Done! The same icon unhides the answer.',
    })
  }
)
