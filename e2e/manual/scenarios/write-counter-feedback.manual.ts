import { byDataCy, contains } from '../../support/test'
import { expect, manualTest } from '../fixtures'
import { closeNotification, findInMyTeaching } from '../steps'
import { students, teacher } from '../users'

manualTest(
  'Vastapalautteen kirjoittaminen',
  {
    annotation: [
      { type: 'sv', description: 'Skriva motrespons' },
      { type: 'en', description: 'Writing counter feedback' },
    ],
  },
  async ({ page, demo, loginAs, caption, curtain, hover, click, fill, t, localize }) => {
    await demo.seed('feedbackClosed', { feedback: true })
    const fbtId = demo.fbtId
    await loginAs(teacher)

    await caption({
      fi: 'Tässä videossa kirjoitetaan opiskelijoille vastapalaute.',
      sv: 'I den här videon skriver vi motrespons till studerandena.',
      en: 'In this video, we write counter feedback to the students.',
    })

    await caption({
      fi: 'Vastapalaute kertoo opiskelijoille, että heidän palautteensa on luettu. Sen voi kirjoittaa kyselyn sulkeuduttua.',
      sv: 'Motresponsen berättar för studerandena att deras respons har lästs. Du kan skriva den när enkäten har stängts.',
      en: 'Counter feedback tells the students that their feedback has been read. You can write it once the survey has closed.',
    })
    await findInMyTeaching(page, click, caption, 'ended')

    await caption({
      fi: 'Vastapalaute puuttuu -merkki vie suoraan kirjoittamaan sitä.',
      sv: 'Märket Svar på responsen saknas tar dig direkt till att skriva den.',
      en: 'The Counter feedback missing label takes you straight to writing it.',
    })
    await click(byDataCy(page, `feedback-response-chip-missing-${fbtId}`).first())

    await caption({
      fi: 'Voit kiittää palautteesta, koota sen yhteen ja kertoa, mitä aiot muuttaa. Konkreettiset muutokset ovat opiskelijoille arvokkaimpia.',
      sv: 'Du kan tacka för responsen, sammanfatta den och berätta vad du tänker ändra. Konkreta ändringar är mest värdefulla för studerandena.',
      en: 'You can thank the students, sum up the feedback and say what you will change. Concrete changes matter most to students.',
    })
    await fill(
      page.locator('#feedback-response-form textarea').first(),
      localize({
        fi: 'Kiitos kaikille palautteesta! Harjoitustehtäviä pidettiin hyödyllisinä, mutta luentojen tahtia toivottiin rauhallisemmaksi. Ensi kerralla luennoilla on enemmän aikaa esimerkeille.',
        sv: 'Tack till alla för responsen! Övningsuppgifterna ansågs nyttiga, men föreläsningarnas tempo önskades lugnare. Nästa gång finns det mer tid för exempel på föreläsningarna.',
        en: 'Thank you all for your feedback! You found the exercises useful but wished for a slower pace in the lectures. Next time, the lectures will have more time for examples.',
      })
    )

    await caption({
      fi: 'Tekstin alla on valinta sähköpostin lähettämisestä. Kun se on valittuna, vastapalaute lähtee sähköpostilla kaikille kurssille ilmoittautuneille.',
      sv: 'Under texten finns valet att skicka e-post. När det är valt skickas motresponsen per e-post till alla som har anmält sig till kursen.',
      en: 'Below the text is the option to send an email. When it is chosen, the counter feedback is emailed to everyone enrolled in the course.',
    })
    await hover(byDataCy(page, 'feedback-response-send-email-checkbox'))

    await caption({
      fi: 'Ilman sitä vastapalaute tallennetaan, ja opiskelijat näkevät sen vain Norpassa.',
      sv: 'Utan det sparas motresponsen, och studerandena ser den bara i Norppa.',
      en: 'Without it, the counter feedback is saved, and students only see it in Norppa.',
    })

    await caption({
      fi: 'Pidetään valinta päällä ja tallennetaan.',
      sv: 'Låt valet vara på och spara.',
      en: 'Keep the option on and save.',
    })
    await click(byDataCy(page, 'openFeedbackResponseSubmitDialog'))

    await caption({
      fi: 'Sähköpostin voi lähettää vain kerran. Tekstiä voi yhä muokata: opiskelijat näkevät uuden version Norpassa.',
      sv: 'E-postmeddelandet kan bara skickas en gång. Du kan fortfarande redigera texten, och studerandena ser den nya versionen i Norppa.',
      en: 'The email can be sent only once. You can still edit the text: students see the new version in Norppa.',
    })
    await click(byDataCy(page, 'saveFeedbackResponse'))
    await closeNotification(page, click, t('common:saveSuccess'))

    await curtain(
      {
        fi: 'Katsotaan opiskelijan näkymää…',
        sv: 'Nu ser vi hur det ser ut för studeranden…',
        en: "Let's see the student's view…",
      },
      async () => {
        await loginAs(students[1])
        await page.goto('/feedbacks')
        await byDataCy(page, 'my-feedbacks-closed-tab').waitFor()
      }
    )

    await caption({
      fi: 'Opiskelija löytää kurssin Kurssipalautteeni-sivun Päättyneet-välilehdeltä.',
      sv: 'Studeranden hittar kursen på fliken Responsen är stängd på sidan Mina responser.',
      en: 'The student finds the course on the Closed tab of the My feedback page.',
    })
    await click(byDataCy(page, 'my-feedbacks-closed-tab'))
    const item = byDataCy(page, `feedback-item-${fbtId}`)

    await caption({
      fi: 'Kurssin kohdalla kerrotaan, että opettaja on antanut vastapalautteen.',
      sv: 'Vid kursen står det att läraren har gett motrespons.',
      en: 'The course shows that the teacher has given counter feedback.',
    })
    await hover(item.getByText(t('userFeedbacks:feedbackResponseGiven')))

    await caption({
      fi: 'Vastapalaute on palautteen yhteenvedon ylimpänä.',
      sv: 'Motresponsen finns överst i sammanfattningen av responsen.',
      en: 'The counter feedback is at the top of the feedback summary.',
    })
    await click(item.getByRole('link', { name: t('userFeedbacks:viewFeedbackSummary') }))
    await expect(contains(page, t('feedbackTargetResults:responseHeading'))).toBeVisible()

    await caption({
      fi: 'Valmista! Vastapalaute on annettu.',
      sv: 'Klart! Motresponsen har getts.',
      en: 'Done! The counter feedback has been given.',
    })
  }
)
