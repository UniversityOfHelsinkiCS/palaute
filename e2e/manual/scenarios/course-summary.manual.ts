import { byDataCy } from '../../support/test'
import { COURSE_CODE } from '../demo'
import { expect, manualTest } from '../fixtures'
import { teacher } from '../users'

manualTest(
  'Kurssiyhteenveto',
  { annotation: { type: 'en', description: 'Course summary' } },
  async ({ page, demo, loginAs, caption, hover, click, pause, t }) => {
    await demo.seed('feedbackClosed', { feedback: true })
    await loginAs(teacher)
    const course = page.locator(`a[href^="/course-summary/course-unit/${COURSE_CODE}"]`)

    await caption({
      fi: 'Tässä videossa katsotaan kurssiyhteenvetoa, jossa ovat kurssikyselyjen tilastot.',
      en: 'In this video, we look at the course summary, which has the statistics of course surveys.',
    })

    // Clicking the navbar link while already on the page empties it, so start from the page login opens
    await caption({
      fi: 'Kurssiyhteenveto avautuu ylävalikosta. Siinä ovat omat kurssisi organisaatioittain.',
      en: 'The course summary opens from the top bar. It has your own courses by organisation.',
    })
    await hover(byDataCy(page, 'navbar-links').locator('a[href="/course-summary"]'))
    await expect(course).toBeVisible()

    // The column headings are slanted, and hovering one shows its whole question
    await caption({
      fi: 'Sarakkeissa ovat yliopistotason asteikkokysymysten keskiarvot. Kysymyksen näkee viemällä hiiren sarakkeen otsikon päälle.',
      en: "The columns have the averages of the university-wide scale questions. Hover over a column's heading to see its question.",
    })
    await hover(page.locator('[id^="sort-"][id$="-label"]').first())
    await pause(1000)

    await caption({
      fi: 'Matalat keskiarvot ovat punaisia, keskitason keltaisia ja korkeat vihreitä.',
      en: 'Low averages are red, middling ones yellow and high ones green.',
    })
    for (const questionId of demo.loweredQuestionIds) {
      await hover(page.locator(`#sort-${questionId}-label`))
      await pause(1000)
    }

    await caption({
      fi: 'Oikealla ovat vastausten määrä, vastanneiden osuus ja vastapalautteen saaneiden toteutusten osuus.',
      en: 'On the right are the number of answers, the share of students who answered and the share of realisations with counter feedback.',
    })
    await hover(page.locator('#sort-feedbackCount-label'))
    await pause(1000)

    await caption({
      fi: 'Oletuksena näkyy kuluva lukuvuosi. Valitaan edellinen lukuvuosi.',
      en: 'By default, the current academic year is shown. Choose the previous year.',
    })
    const year = page.getByRole('combobox', { name: new RegExp(`^${t('courseSummary:year')}`) })
    await click(year)
    await click(page.getByRole('option').nth(1))
    await expect(course).toBeVisible()

    await caption({
      fi: 'Kurssi on mukana, jos sen päivämäärät Sisussa osuvat valitulle ajalle.',
      en: 'A course is included if its dates in Sisu fall within the chosen period.',
    })

    await caption({
      fi: 'Opintojakson nimestä pääset sen sivulle, jossa on rivi jokaiselle toteutukselle.',
      en: "The course unit's name takes you to its page, with a row for each realisation.",
    })
    await click(course)
    const realisation = page.locator(`a[href^="/targets/"]`).first()
    await expect(realisation).toBeVisible()

    await caption({
      fi: 'Toteutuksen nimestä pääset sen kyselyn vastauksiin.',
      en: "A realisation's name takes you to its survey's answers.",
    })
    await hover(realisation)

    await caption({
      fi: 'Valmista! Näin löydät kurssiesi palautteen tilastot.',
      en: 'Done! This is where you find the feedback statistics of your courses.',
    })
  }
)
