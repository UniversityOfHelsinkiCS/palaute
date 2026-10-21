import { byDataCy, contains } from '../../support/test'
import { expect, manualTest } from '../fixtures'
import { closeNotification, openFromMyTeaching } from '../steps'
import { teacher } from '../users'

manualTest(
  'Muistutusviestin lähettäminen',
  { annotation: { type: 'en', description: 'Sending a reminder' } },
  async ({ page, demo, loginAs, caption, click, t }) => {
    await demo.seed('feedbackOpen', { feedback: true })
    const fbtId = demo.fbtId
    await loginAs(teacher)

    await caption({
      fi: 'Tässä videossa lähetetään muistutusviesti opiskelijoille, jotka eivät ole vielä vastanneet.',
      en: "In this video, we send a reminder to the students who haven't answered yet.",
    })

    await caption({
      fi: 'Muistutuksen voi lähettää, kun kysely on auki. Se on helpoin tapa saada lisää vastauksia.',
      en: 'You can send a reminder while the survey is open. It is the easiest way to get more answers.',
    })
    await openFromMyTeaching(page, click, caption, fbtId, 'active')

    await caption({ fi: 'Avataan Jaa-välilehti.', en: 'Open the Share tab.' })
    await click(byDataCy(page, 'feedback-target-share-feedback-tab'))

    await caption({ fi: 'Valitaan Lähetä muistutusviesti.', en: 'Choose Send a reminder.' })
    await click(page.getByRole('button', { name: t('feedbackTargetResults:sendReminder') }))
    const message = page.getByRole('textbox', { name: t('feedbackTargetResults:writeAMessage') })
    await expect(message).toBeVisible()

    await caption({
      fi: 'Viesti on valmiina. Jos lähetät sen sellaisenaan, jokainen opiskelija saa sen omalla kielellään.',
      en: 'The message is ready. If you send it as it is, each student gets it in their own language.',
    })

    await caption({
      fi: 'Jos muokkaat viestiä, se lähtee sellaisenaan, joten sinun tulee kirjoittaa se kaikilla tarvittavilla kielillä. Linkki kyselyyn lisätään aina.',
      en: 'If you edit the message, it is sent as you wrote it, so you need to write it in every language your students need. The link to the survey is always added.',
    })

    await caption({ fi: 'Lähetetään muistutus.', en: 'Send the reminder.' })
    await click(page.getByRole('button', { name: t('feedbackTargetResults:sendReminderButton') }))
    await closeNotification(page, click, t('common:saveSuccess'))

    await caption({
      fi: 'Muistutuksen voi lähettää kerran vuorokaudessa. Sivulla näkyy, milloin se on viimeksi lähetetty.',
      en: 'A reminder can be sent once a day. The page shows when it was last sent.',
    })
    await expect(contains(page, t('feedbackTargetResults:reminderLastSent'))).toBeVisible()

    await caption({
      fi: 'Valmista! Muistutus lähtee vain niille, jotka eivät ole vielä vastanneet.',
      en: "Done! The reminder only goes to students who haven't answered yet.",
    })
  }
)
