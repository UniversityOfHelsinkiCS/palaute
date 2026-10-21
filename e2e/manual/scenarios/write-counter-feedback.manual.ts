import { byDataCy, contains } from '../../support/test'
import { expect, manualTest } from '../fixtures'
import { closeNotification, findInMyTeaching } from '../steps'
import { students, teacher } from '../users'

manualTest(
  'Vastapalautteen kirjoittaminen',
  { annotation: { type: 'en', description: 'Writing counter feedback' } },
  async ({ page, demo, loginAs, caption, curtain, hover, click, fill, t, localize }) => {
    await demo.seed('feedbackClosed', { feedback: true })
    const fbtId = demo.fbtId
    await loginAs(teacher)

    await caption({
      fi: 'Tässä videossa kirjoitetaan opiskelijoille vastapalaute.',
      en: 'In this video, we write counter feedback to the students.',
    })

    await caption({
      fi: 'Vastapalaute kertoo opiskelijoille, että heidän palautteensa on luettu. Sen voi kirjoittaa kyselyn sulkeuduttua.',
      en: 'Counter feedback tells the students that their feedback has been read. You can write it once the survey has closed.',
    })
    await findInMyTeaching(page, click, caption, 'ended')

    await caption({
      fi: 'Vastapalaute puuttuu -merkki vie suoraan kirjoittamaan sitä.',
      en: 'The Counter feedback missing label takes you straight to writing it.',
    })
    await click(byDataCy(page, `feedback-response-chip-missing-${fbtId}`).first())

    await caption({
      fi: 'Voit kiittää palautteesta, koota sen yhteen ja kertoa, mitä aiot muuttaa. Konkreettiset muutokset ovat opiskelijoille arvokkaimpia.',
      en: 'You can thank the students, sum up the feedback and say what you will change. Concrete changes matter most to students.',
    })
    await fill(
      page.locator('#feedback-response-form textarea').first(),
      localize({
        fi: 'Kiitos kaikille palautteesta! Harjoitustehtäviä pidettiin hyödyllisinä, mutta luentojen tahtia toivottiin rauhallisemmaksi. Ensi kerralla luennoilla on enemmän aikaa esimerkeille.',
        en: 'Thank you all for your feedback! You found the exercises useful but wished for a slower pace in the lectures. Next time, the lectures will have more time for examples.',
      })
    )

    await caption({
      fi: 'Tekstin alla on valinta sähköpostin lähettämisestä. Kun se on valittuna, vastapalaute lähtee sähköpostilla kaikille kurssille ilmoittautuneille.',
      en: 'Below the text is the option to send an email. When it is chosen, the counter feedback is emailed to everyone enrolled in the course.',
    })
    await hover(byDataCy(page, 'feedback-response-send-email-checkbox'))

    await caption({
      fi: 'Ilman sitä vastapalaute tallennetaan, ja opiskelijat näkevät sen vain Norpassa.',
      en: 'Without it, the counter feedback is saved, and students only see it in Norppa.',
    })

    await caption({
      fi: 'Pidetään valinta päällä ja tallennetaan.',
      en: 'Keep the option on and save.',
    })
    await click(byDataCy(page, 'openFeedbackResponseSubmitDialog'))

    await caption({
      fi: 'Sähköpostin voi lähettää vain kerran. Tekstiä voi yhä muokata: opiskelijat näkevät uuden version Norpassa.',
      en: 'The email can be sent only once. You can still edit the text: students see the new version in Norppa.',
    })
    await click(byDataCy(page, 'saveFeedbackResponse'))
    await closeNotification(page, click, t('common:saveSuccess'))

    await curtain({ fi: 'Katsotaan opiskelijan näkymää…', en: "Let's see the student's view…" }, async () => {
      await loginAs(students[1])
      await page.goto('/feedbacks')
      await byDataCy(page, 'my-feedbacks-closed-tab').waitFor()
    })

    await caption({
      fi: 'Opiskelija löytää kurssin Kurssipalautteeni-sivun Päättyneet-välilehdeltä.',
      en: 'The student finds the course on the Closed tab of the My feedback page.',
    })
    await click(byDataCy(page, 'my-feedbacks-closed-tab'))
    const item = byDataCy(page, `feedback-item-${fbtId}`)

    await caption({
      fi: 'Kurssin kohdalla kerrotaan, että opettaja on antanut vastapalautteen.',
      en: 'The course shows that the teacher has given counter feedback.',
    })
    await hover(item.getByText(t('userFeedbacks:feedbackResponseGiven')))

    await caption({
      fi: 'Vastapalaute on palautteen yhteenvedon ylimpänä.',
      en: 'The counter feedback is at the top of the feedback summary.',
    })
    await click(item.getByRole('link', { name: t('userFeedbacks:viewFeedbackSummary') }))
    await expect(contains(page, t('feedbackTargetResults:responseHeading'))).toBeVisible()

    await caption({
      fi: 'Valmista! Vastapalaute on annettu.',
      en: 'Done! The counter feedback has been given.',
    })
  }
)
