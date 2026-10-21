import { byDataCy, contains, textField } from '../../support/test'
import { expect, manualTest } from '../fixtures'
import { closeNotification, openFromMyTeaching } from '../steps'
import { student, teacher } from '../users'

manualTest(
  'Opettaja ottaa käyttöön jatkuvan palautteen',
  { annotation: { type: 'en', description: 'Turning on continuous feedback' } },
  async ({ page, demo, loginAs, caption, click, fill, curtain, t, localize }) => {
    await demo.seed('ongoing')
    const fbtId = demo.fbtId
    await loginAs(teacher)

    await caption({
      fi: 'Tässä videossa otetaan kurssilla käyttöön jatkuva palaute.',
      en: 'In this video, we turn on continuous feedback for a course.',
    })

    await caption({
      fi: 'Jatkuvalla palautteella opiskelijat voivat antaa lyhyttä palautetta kurssin aikana, kunnes varsinainen palautekysely avautuu.',
      en: 'With continuous feedback, students can give short feedback during the course, until the actual course survey opens.',
    })
    await openFromMyTeaching(page, click, caption, fbtId, 'active')

    await caption({
      fi: 'Jatkuva palaute otetaan käyttöön Jatkuva palaute -välilehdellä.',
      en: 'Continuous feedback is turned on in the Continuous feedback tab.',
    })
    await click(byDataCy(page, 'feedback-target-continuous-feedback-tab'))

    await caption({
      fi: 'Otetaan jatkuva palaute käyttöön kytkimestä. Muutos tallentuu heti.',
      en: 'Switch on continuous feedback. The change is saved at once.',
    })
    await click(byDataCy(page, 'activateContinuousFeedback'))
    await closeNotification(page, click, t('common:saveSuccess'))

    await caption({
      fi: 'Halutessaan voi tilata päivittäisen sähköpostikoosteen uudesta palautteesta.',
      en: 'If you like, you can get a daily email of new feedback.',
    })
    await click(page.getByLabel(t('feedbackTargetView:activateContinuousFeedbackDigest')))
    await closeNotification(page, click, t('common:saveSuccess'))

    await caption({
      fi: 'Johdannossa voi kertoa opiskelijoille, millaista palautetta toivotaan.',
      en: 'In the introduction, you can tell students what kind of feedback you would like.',
    })
    await fill(
      textField(page, 'continuousFeedbackPreamble'),
      localize({
        fi: 'Kerro, mikä auttaa oppimistasi ja mitä voisimme parantaa.',
        en: 'Tell us what helps you learn and what we could improve.',
      })
    )

    await caption({ fi: 'Tallennetaan johdanto.', en: 'Save the introduction.' })
    await click(byDataCy(page, 'saveContinuousFeedbackPreamble'))
    await closeNotification(page, click, t('common:saveSuccess'))

    await caption({
      fi: 'Opiskelijat voivat nyt antaa jatkuvaa palautetta.',
      en: 'Students can now give continuous feedback.',
    })

    await caption({
      fi: 'Kun opiskelija on antanut palautetta, se näkyy tällä sivulla.',
      en: 'When a student has given feedback, it shows on this page.',
    })
    const studentFeedback = localize({
      fi: 'Luennoilla voisi olla enemmän esimerkkejä.',
      en: 'The lectures could have more examples.',
    })
    const feedback = contains(page, studentFeedback)
    await curtain({ fi: 'Opiskelija antaa palautetta…', en: 'A student gives feedback…' }, async () => {
      await demo.giveContinuousFeedback(student, studentFeedback)
      // Reopening the tab fetches the new feedback faster than reloading the page
      const settingsTab = byDataCy(page, 'feedback-target-settings-tab')
      // Dispatched, so the cursor stays where the viewer last saw it
      await settingsTab.dispatchEvent('click')
      await expect(settingsTab).toHaveAttribute('aria-selected', 'true')
      await byDataCy(page, 'feedback-target-continuous-feedback-tab').dispatchEvent('click')
      await feedback.evaluate(element => element.scrollIntoView({ block: 'center' }))
    })
    await expect(feedback).toBeVisible()

    await caption({
      fi: 'Palautteeseen voi vastata. Avataan vastauskenttä.',
      en: 'You can reply to the feedback. Open the reply field.',
    })
    await click(byDataCy(page, 'respondContinuousFeedback'))

    await caption({ fi: 'Kirjoitetaan vastaus.', en: 'Write the reply.' })
    await fill(
      textField(page, 'continuousFeedbackResponseInput'),
      localize({
        fi: 'Kiitos! Lisään seuraavalle luennolle esimerkkejä.',
        en: "Thanks! I'll add examples to the next lecture.",
      })
    )

    await caption({
      fi: 'Lähetetään vastaus. Palautteen antaja saa vastauksesta sähköpostin.',
      en: 'Send the reply. The student who gave the feedback gets it by email.',
    })
    await click(byDataCy(page, 'sendContinuousFeedbackResponse'))
    await closeNotification(page, click, t('feedbackTargetView:continuousFeedbackResponseSuccessAlert'))

    await caption({
      fi: 'Valmista! Jatkuva palaute on käytössä.',
      en: 'Done! Continuous feedback is on.',
    })
  }
)
