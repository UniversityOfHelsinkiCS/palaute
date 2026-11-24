import { byDataCy, contains, textField } from '../../support/test'
import { expect, manualTest } from '../fixtures'
import { closeNotification, openFromMyTeaching } from '../steps'
import { student, teacher } from '../users'

manualTest(
  'Opettaja ottaa käyttöön jatkuvan palautteen',
  {
    annotation: [
      { type: 'sv', description: 'Slå på kontinuerlig respons' },
      { type: 'en', description: 'Turning on continuous feedback' },
    ],
  },
  async ({ page, demo, loginAs, caption, click, fill, curtain, t, localize }) => {
    await demo.seed('ongoing')
    const fbtId = demo.fbtId
    await loginAs(teacher)

    await caption({
      fi: 'Tässä videossa otetaan kurssilla käyttöön jatkuva palaute.',
      sv: 'I den här videon slår vi på kontinuerlig respons för en kurs.',
      en: 'In this video, we turn on continuous feedback for a course.',
    })

    await caption({
      fi: 'Jatkuvalla palautteella opiskelijat voivat antaa lyhyttä palautetta kurssin aikana, kunnes varsinainen palautekysely avautuu.',
      sv: 'Med kontinuerlig respons kan studerandena ge kort respons under kursen, tills den egentliga kursenkäten öppnas.',
      en: 'With continuous feedback, students can give short feedback during the course, until the actual course survey opens.',
    })
    await openFromMyTeaching(page, click, caption, fbtId, 'active')

    await caption({
      fi: 'Jatkuva palaute otetaan käyttöön Jatkuva palaute -välilehdellä.',
      sv: 'Kontinuerlig respons slås på under fliken Kontinuerlig respons.',
      en: 'Continuous feedback is turned on in the Continuous feedback tab.',
    })
    await click(byDataCy(page, 'feedback-target-continuous-feedback-tab'))

    await caption({
      fi: 'Otetaan jatkuva palaute käyttöön kytkimestä. Muutos tallentuu heti.',
      sv: 'Slå på kontinuerlig respons med reglaget. Ändringen sparas genast.',
      en: 'Switch on continuous feedback. The change is saved at once.',
    })
    await click(byDataCy(page, 'activateContinuousFeedback'))
    await closeNotification(page, click, t('common:saveSuccess'))

    await caption({
      fi: 'Halutessaan voi tilata päivittäisen sähköpostikoosteen uudesta palautteesta.',
      sv: 'Om du vill kan du få en daglig sammanfattning av ny respons per e-post.',
      en: 'If you like, you can get a daily email of new feedback.',
    })
    await click(page.getByLabel(t('feedbackTargetView:activateContinuousFeedbackDigest')))
    await closeNotification(page, click, t('common:saveSuccess'))

    await caption({
      fi: 'Johdannossa voi kertoa opiskelijoille, millaista palautetta toivotaan.',
      sv: 'I inledningen kan du berätta för studerandena vilken sorts respons du önskar.',
      en: 'In the introduction, you can tell students what kind of feedback you would like.',
    })
    await fill(
      textField(page, 'continuousFeedbackPreamble'),
      localize({
        fi: 'Kerro, mikä auttaa oppimistasi ja mitä voisimme parantaa.',
        sv: 'Berätta vad som hjälper dig att lära dig och vad vi kunde förbättra.',
        en: 'Tell us what helps you learn and what we could improve.',
      })
    )

    await caption({ fi: 'Tallennetaan johdanto.', sv: 'Spara inledningen.', en: 'Save the introduction.' })
    await click(byDataCy(page, 'saveContinuousFeedbackPreamble'))
    await closeNotification(page, click, t('common:saveSuccess'))

    await caption({
      fi: 'Opiskelijat voivat nyt antaa jatkuvaa palautetta.',
      sv: 'Studerandena kan nu ge kontinuerlig respons.',
      en: 'Students can now give continuous feedback.',
    })

    await caption({
      fi: 'Kun opiskelija on antanut palautetta, se näkyy tällä sivulla.',
      sv: 'När en studerande har gett respons syns den på den här sidan.',
      en: 'When a student has given feedback, it shows on this page.',
    })
    const studentFeedback = localize({
      fi: 'Luennoilla voisi olla enemmän esimerkkejä.',
      sv: 'Föreläsningarna kunde ha fler exempel.',
      en: 'The lectures could have more examples.',
    })
    const feedback = contains(page, studentFeedback)
    await curtain(
      { fi: 'Opiskelija antaa palautetta…', sv: 'En studerande ger respons…', en: 'A student gives feedback…' },
      async () => {
        await demo.giveContinuousFeedback(student, studentFeedback)
        // Reopening the tab fetches the new feedback faster than reloading the page
        const surveyTab = byDataCy(page, 'feedback-target-survey-tab')
        // Dispatched, so the cursor stays where the viewer last saw it
        await surveyTab.dispatchEvent('click')
        await expect(surveyTab).toHaveAttribute('aria-selected', 'true')
        await byDataCy(page, 'feedback-target-continuous-feedback-tab').dispatchEvent('click')
        await feedback.evaluate(element => element.scrollIntoView({ block: 'center' }))
      }
    )
    await expect(feedback).toBeVisible()

    await caption({
      fi: 'Palautteeseen voi vastata. Avataan vastauskenttä.',
      sv: 'Du kan svara på responsen. Öppna svarsfältet.',
      en: 'You can reply to the feedback. Open the reply field.',
    })
    await click(byDataCy(page, 'respondContinuousFeedback'))

    await caption({ fi: 'Kirjoitetaan vastaus.', sv: 'Skriv svaret.', en: 'Write the reply.' })
    await fill(
      textField(page, 'continuousFeedbackResponseInput'),
      localize({
        fi: 'Kiitos! Lisään seuraavalle luennolle esimerkkejä.',
        sv: 'Tack! Jag lägger till exempel till nästa föreläsning.',
        en: "Thanks! I'll add examples to the next lecture.",
      })
    )

    await caption({
      fi: 'Lähetetään vastaus. Palautteen antaja saa vastauksesta sähköpostin.',
      sv: 'Skicka svaret. Den studerande som gav responsen får svaret per e-post.',
      en: 'Send the reply. The student who gave the feedback gets it by email.',
    })
    await click(byDataCy(page, 'sendContinuousFeedbackResponse'))
    await closeNotification(page, click, t('feedbackTargetView:continuousFeedbackResponseSuccessAlert'))

    await caption({
      fi: 'Valmista! Jatkuva palaute on käytössä.',
      sv: 'Klart! Kontinuerlig respons är på.',
      en: 'Done! Continuous feedback is on.',
    })
  }
)
