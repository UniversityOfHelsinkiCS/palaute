import { byDataCy } from '../../support/test'
import { expect, manualTest } from '../fixtures'
import { openFromMyTeaching } from '../steps'
import { teacher } from '../users'

manualTest(
  'Vastausten näkyvyyden muuttaminen',
  {
    annotation: [
      { type: 'sv', description: 'Ändra svarens synlighet' },
      { type: 'en', description: 'Changing who sees the answers' },
    ],
  },
  async ({ page, demo, loginAs, caption, click, scrollTo, pause, t, localize }) => {
    await demo.seed('feedbackClosed', { feedback: true })
    const fbtId = demo.fbtId
    await loginAs(teacher)

    await caption({
      fi: 'Tässä videossa muutetaan avoimen kysymyksen vastaukset julkisiksi.',
      sv: 'I den här videon gör vi svaren på en öppen fråga publika.',
      en: 'In this video, we make the answers to an open question public.',
    })

    await caption({
      fi: 'Julkisten kysymysten vastaukset näkevät myös kurssin opiskelijat ja muut opettajat. Avoimet kysymykset eivät ole oletuksena julkisia.',
      sv: 'Svaren på publika frågor syns också för kursens studerande och andra lärare. Öppna frågor är inte publika som standard.',
      en: "The answers to public questions can also be seen by the course's students and other teachers. Open questions are not public by default.",
    })
    await openFromMyTeaching(page, click, caption, fbtId, 'ended')

    await caption({ fi: 'Avataan Vastaukset-välilehti.', sv: 'Öppna fliken Responser.', en: 'Open the Answers tab.' })
    await click(byDataCy(page, 'feedback-target-results-tab'))

    const openQuestion = page.getByRole('region', {
      name: localize({
        fi: 'Muita huomioita (avoin kysymys)',
        sv: 'Övriga kommentarer (öppen fråga)',
        en: 'Additional comments (open-ended question)',
      }),
    })
    const notPublic = openQuestion.getByRole('button', { name: new RegExp(`^${t('common:notPublic')}:`) })
    await caption({
      fi: 'Jokaisen kysymyksen alla näkyy, onko se julkinen. Avataan avoimen kysymyksen valinta.',
      sv: 'Under varje fråga syns om den är publik. Öppna inställningen för den öppna frågan.',
      en: 'Under each question, you can see whether it is public. Open the setting of the open question.',
    })
    await scrollTo(openQuestion)
    await click(notPublic)

    await caption({
      fi: 'Avoimen kysymyksen voi tehdä julkiseksi vasta kyselyn sulkeuduttua, sillä vastauksissa voi olla henkilötietoja. Lue vastaukset siis ensin.',
      sv: 'En öppen fråga kan göras publik först när enkäten har stängts, eftersom svaren kan innehålla personuppgifter. Läs alltså svaren först.',
      en: 'An open question can only be made public after the survey has closed, as the answers may contain personal data. So read the answers first.',
    })
    await pause(1000)

    await caption({
      fi: 'Valitaan, että vastaukset näkyvät kurssin opiskelijoille.',
      sv: 'Välj att svaren syns för kursens studerande.',
      en: "Choose that the answers are visible to the course's students.",
    })
    // The browser's own confirmation isn't in the recording
    await click(page.getByRole('radio', { name: t('common:publicInfo') }))
    await page.keyboard.press('Escape')
    await expect(openQuestion.getByRole('button', { name: new RegExp(`^${t('common:public')}:`) })).toBeVisible()

    await caption({
      fi: 'Valmista! Kysymys on nyt julkinen, ja muutos tallentui heti.',
      sv: 'Klart! Frågan är nu publik, och ändringen sparades genast.',
      en: 'Done! The question is now public, and the change was saved at once.',
    })
  }
)
