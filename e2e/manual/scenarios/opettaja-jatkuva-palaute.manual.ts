import { byDataCy, contains, textField } from '../../support/test'
import { expect, manualTest } from '../fixtures'
import { closeNotification, openFromMyTeaching } from '../steps'
import { student, teacher } from '../users'

manualTest(
  'Opettaja ottaa käyttöön jatkuvan palautteen',
  async ({ page, demo, loginAs, caption, click, fill, curtain }) => {
    await demo.seed('ongoing')
    const fbtId = demo.fbtId
    await loginAs(teacher)

    await caption({
      fi: 'Tässä videossa otetaan kurssilla käyttöön jatkuva palaute.',
    })

    await caption({
      fi: 'Jatkuvalla palautteella opiskelijat voivat antaa lyhyttä palautetta kurssin aikana, kunnes varsinainen palautekysely avautuu.',
    })
    await openFromMyTeaching(page, click, caption, fbtId, 'active')

    await caption({
      fi: 'Jatkuva palaute otetaan käyttöön Jatkuva palaute -välilehdellä.',
    })
    await click(byDataCy(page, 'feedback-target-continuous-feedback-tab'))

    await caption({
      fi: 'Otetaan jatkuva palaute käyttöön kytkimestä. Muutos tallentuu heti.',
    })
    await click(byDataCy(page, 'activateContinuousFeedback'))
    await closeNotification(page, click, 'Tiedot tallennettiin onnistuneesti.')

    await caption({
      fi: 'Halutessaan voi tilata päivittäisen sähköpostikoosteen uudesta palautteesta.',
    })
    await click(page.getByLabel('Lähetä päivittäinen sähköpostikooste uudesta jatkuvasta palautteesta'))
    await closeNotification(page, click, 'Tiedot tallennettiin onnistuneesti.')

    await caption({
      fi: 'Johdannossa voi kertoa opiskelijoille, millaista palautetta toivotaan.',
    })
    await fill(
      textField(page, 'continuousFeedbackPreamble'),
      'Kerro, mikä auttaa oppimistasi ja mitä voisimme parantaa.'
    )

    await caption({ fi: 'Tallennetaan johdanto.' })
    await click(byDataCy(page, 'saveContinuousFeedbackPreamble'))
    await closeNotification(page, click, 'Tiedot tallennettiin onnistuneesti.')

    await caption({ fi: 'Opiskelijat voivat nyt antaa jatkuvaa palautetta.' })

    await caption({
      fi: 'Kun opiskelija on antanut palautetta, se näkyy tällä sivulla.',
    })
    const feedback = contains(page, 'Luennoilla voisi olla enemmän esimerkkejä.')
    await curtain({ fi: 'Opiskelija antaa palautetta…' }, async () => {
      await demo.giveContinuousFeedback(student, 'Luennoilla voisi olla enemmän esimerkkejä.')
      // Reopening the tab fetches the new feedback faster than reloading the page
      const settingsTab = byDataCy(page, 'feedback-target-settings-tab')
      // Dispatched, so the cursor stays where the viewer last saw it
      await settingsTab.dispatchEvent('click')
      await expect(settingsTab).toHaveAttribute('aria-selected', 'true')
      await byDataCy(page, 'feedback-target-continuous-feedback-tab').dispatchEvent('click')
      await feedback.evaluate(element => element.scrollIntoView({ block: 'center' }))
    })
    await expect(feedback).toBeVisible()

    await caption({ fi: 'Palautteeseen voi vastata. Avataan vastauskenttä.' })
    await click(byDataCy(page, 'respondContinuousFeedback'))

    await caption({ fi: 'Kirjoitetaan vastaus.' })
    await fill(textField(page, 'continuousFeedbackResponseInput'), 'Kiitos! Lisään seuraavalle luennolle esimerkkejä.')

    await caption({
      fi: 'Lähetetään vastaus. Palautteen antaja saa vastauksesta sähköpostin.',
    })
    await click(byDataCy(page, 'sendContinuousFeedbackResponse'))
    await closeNotification(page, click, 'Vastaus lähetetty onnistuneesti')

    await caption({ fi: 'Valmista! Jatkuva palaute on käytössä.' })
  }
)
