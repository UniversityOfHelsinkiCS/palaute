import { byDataCy } from '../../support/test'
import { expect, manualTest } from '../fixtures'
import { closeNotification, openFromMyTeaching } from '../steps'
import { teacher } from '../users'

manualTest(
  'Kyselyn linkin jakaminen',
  {
    annotation: [
      { type: 'sv', description: 'Dela enkätens länk' },
      { type: 'en', description: 'Sharing the survey link' },
    ],
  },
  async ({ page, demo, loginAs, caption, click, scrollTo, pause, t }) => {
    await demo.seed('ongoing')
    const fbtId = demo.fbtId
    await loginAs(teacher)

    await caption({
      fi: 'Tässä videossa kopioidaan kyselyn linkki opiskelijoille jaettavaksi.',
      sv: 'I den här videon kopierar vi enkätens länk för att dela den med studerandena.',
      en: 'In this video, we copy the survey link to share it with students.',
    })

    await caption({
      fi: 'Linkki toimii jo ennen kyselyn avautumista, joten sen voi lisätä etukäteen esimerkiksi Moodleen.',
      sv: 'Länken fungerar redan innan enkäten öppnas, så du kan lägga till den i förväg, till exempel i Moodle.',
      en: 'The link works before the survey opens, so you can add it to Moodle, for example, in advance.',
    })
    await openFromMyTeaching(page, click, caption, fbtId, 'active')

    await caption({
      fi: 'Avataan Kysely-välilehden alta Jaa-välilehti.',
      sv: 'Öppna fliken Dela under fliken Enkäten.',
      en: 'Open the Share tab under the Survey tab.',
    })
    await click(byDataCy(page, 'feedback-target-share-feedback-tab'))

    await caption({
      fi: 'Kopioidaan opiskelijan vastauslinkki leikepöydälle.',
      sv: 'Kopiera studerandenas länk till enkäten till urklipp.',
      en: "Copy the student's link to the survey to the clipboard.",
    })
    await click(page.getByRole('button', { name: new RegExp(`^${t('common:copyToClipBoard')}`) }))
    await closeNotification(page, click, t('feedbackTargetView:linkCopied'))

    await caption({
      fi: 'QR-koodin opiskelijat voivat lukea puhelimellaan esimerkiksi viimeisen luennon dialta. Sen saa jaettua helpoiten kuvakaappauksena.',
      sv: 'Studerandena kan läsa QR-koden med sin telefon, till exempel från bilderna på den sista föreläsningen. Det enklaste sättet att dela den är som en skärmdump.',
      en: 'Students can scan the QR code with their phones, for example from the slides of the last lecture. A screenshot is the easiest way to share it.',
    })
    const qrCode = page.locator('#feedback-target-tab-content svg, #feedback-target-tab-content canvas').first()
    await scrollTo(qrCode)
    await expect(qrCode).toBeVisible()
    await pause(1500)

    await caption({
      fi: 'Valmista! Kyselyyn voivat vastata vain kurssille ilmoittautuneet opiskelijat.',
      sv: 'Klart! Bara studerande som har anmält sig till kursen kan svara på enkäten.',
      en: 'Done! Only students enrolled in the course can answer the survey.',
    })
  }
)
