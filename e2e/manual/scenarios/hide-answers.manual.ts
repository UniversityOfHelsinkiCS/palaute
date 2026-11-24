import { byDataCy } from '../../support/test'
import { expect, manualTest } from '../fixtures'
import { closeNotification, openFromMyTeaching } from '../steps'
import { teacher } from '../users'

const ANSWER = 'Luennoilla eteni välillä liian nopeasti.'

manualTest(
  'Avoimen vastauksen piilottaminen',
  {
    annotation: [
      { type: 'sv', description: 'Gömma ett öppet svar' },
      { type: 'en', description: 'Hiding an open answer' },
    ],
  },
  async ({ page, demo, loginAs, caption, click, scrollTo, t }) => {
    await demo.seed('feedbackClosed', { feedback: true })
    const fbtId = demo.fbtId
    await loginAs(teacher)

    await caption({
      fi: 'Tässä videossa piilotetaan avoin vastaus.',
      sv: 'I den här videon gömmer vi ett svar på en öppen fråga.',
      en: 'In this video, we hide an answer to an open question.',
    })

    await caption({
      fi: 'Jos vastauksessa on henkilötietoja, kuten opiskelijanumero, tai se on muuten asiaton, sen voi piilottaa.',
      sv: 'Om ett svar innehåller personuppgifter, som ett studentnummer, eller annars är olämpligt, kan du gömma det.',
      en: 'If an answer contains personal data, like a student number, or is otherwise inappropriate, you can hide it.',
    })
    await openFromMyTeaching(page, click, caption, fbtId, 'ended')

    await caption({ fi: 'Avataan Vastaukset-välilehti.', sv: 'Öppna fliken Responser.', en: 'Open the Answers tab.' })
    await click(byDataCy(page, 'feedback-target-results-tab'))

    const answer = page.getByRole('listitem').filter({ hasText: ANSWER })
    await caption({
      fi: 'Etsitään vastaus avoimista kysymyksistä.',
      sv: 'Leta upp svaret bland de öppna frågorna.',
      en: 'Find the answer under the open questions.',
    })
    await scrollTo(answer)

    await caption({
      fi: 'Piilotetaan vastaus sen vieressä olevasta silmäkuvakkeesta.',
      sv: 'Göm svaret med ögonikonen bredvid det.',
      en: 'Hide the answer with the eye icon next to it.',
    })
    await click(answer.getByRole('button', { name: t('feedbackTargetResults:setHidden') }))
    await closeNotification(page, click, new RegExp(ANSWER.slice(0, 10)))

    await caption({
      fi: 'Vastaus on piilotettu kaikilta, jotka näkevät vain julkiset vastaukset. Sinä näet sen edelleen piilotetuksi merkittynä.',
      sv: 'Svaret göms för alla som bara ser publika svar. Du ser det fortfarande, märkt som gömt.',
      en: 'The answer is hidden from everyone who sees only public answers. You still see it, marked as hidden.',
    })
    const unhide = answer.getByRole('button', { name: t('feedbackTargetResults:setVisible') })
    await expect(unhide).toBeVisible()

    await caption({
      fi: 'Valmista! Piilotuksen saa pois samasta kuvakkeesta.',
      sv: 'Klart! Med samma ikon visar du svaret igen.',
      en: 'Done! The same icon unhides the answer.',
    })
  }
)
