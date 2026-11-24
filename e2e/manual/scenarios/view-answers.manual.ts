import { byDataCy, contains } from '../../support/test'
import { expect, manualTest } from '../fixtures'
import { openFromMyTeaching } from '../steps'
import { teacher } from '../users'

manualTest(
  'Vastausten katsominen',
  {
    annotation: [
      { type: 'sv', description: 'Granska svaren' },
      { type: 'en', description: 'Viewing the answers' },
    ],
  },
  async ({ page, demo, loginAs, caption, hover, click, scrollTo, pause, t, localize }) => {
    await demo.seed('feedbackOpen', { feedback: true })
    const fbtId = demo.fbtId
    await loginAs(teacher)

    await caption({
      fi: 'Tässä videossa katsotaan kyselyn vastauksia.',
      sv: 'I den här videon granskar vi enkätens svar.',
      en: "In this video, we look at a survey's answers.",
    })

    await caption({
      fi: 'Vastaukset näkyvät ensimmäisestä vastaajasta lähtien, joten niitä voi seurata jo kyselyn ollessa auki.',
      sv: 'Svaren syns från och med den första som svarar, så du kan följa dem redan medan enkäten är öppen.',
      en: 'The answers show from the first respondent on, so you can follow them while the survey is still open.',
    })
    await openFromMyTeaching(page, click, caption, fbtId, 'active')

    await caption({
      fi: 'Avataan Vastaukset-välilehti.',
      sv: 'Öppna fliken Responser.',
      en: 'Open the Answers tab.',
    })
    await click(byDataCy(page, 'feedback-target-results-tab'))

    await caption({
      fi: 'Ylimpänä on vastausten kertymä päivittäin osuutena kyselyn opiskelijoista.',
      sv: 'Överst syns hur antalet svar har ökat dag för dag, som andel av enkätens studerande.',
      en: "At the top is the daily total of answers, as a share of the survey's students.",
    })
    await hover(byDataCy(page, 'feedback-target-results-feedback-chart'))
    await pause(1500)

    await caption({
      fi: 'Sen alla ovat kysymykset samassa järjestyksessä kuin kyselyssä.',
      sv: 'Under det finns frågorna i samma ordning som i enkäten.',
      en: 'Below it are the questions, in the same order as in the survey.',
    })
    await caption({
      fi: 'Asteikko- ja valintakysymysten vastausjakaumat näytetään kaavioina. Keskiarvoon ei lasketa ”ei osaa sanoa” -vastauksia.',
      sv: 'Svaren på skal- och valfrågorna visas som diagram. Svar med alternativet ingen uppgift räknas inte med i medeltalet.',
      en: 'The scale and choice questions show how the answers are spread, as charts. The average leaves out “don’t know” answers.',
    })
    await hover(page.getByRole('table', { name: t('feedbackView:dataTableCaption') }).first())
    await pause(1500)

    await caption({
      fi: 'Kaaviot voi näyttää myös taulukkoina.',
      sv: 'Diagrammen kan också visas som tabeller.',
      en: 'The charts can also be shown as tables.',
    })
    await click(
      page.getByRole('button', {
        name: new RegExp(`^${t('feedbackTargetResults:tableView')}`),
      })
    )
    await pause(1500)

    const openQuestion = page.getByRole('region', {
      name: localize({
        fi: 'Muita huomioita (avoin kysymys)',
        sv: 'Övriga kommentarer (öppen fråga)',
        en: 'Additional comments (open-ended question)',
      }),
    })
    await caption({
      fi: 'Avointen kysymysten vastaukset ovat aakkosjärjestyksessä. Niistä näytetään ensin muutama.',
      sv: 'Svaren på de öppna frågorna är i alfabetisk ordning. Först visas några av dem.',
      en: 'The answers to open questions are in alphabetical order. A few of them show first.',
    })
    await scrollTo(openQuestion)
    await pause(1000)

    await caption({
      fi: 'Loput saa näkyviin vastausten alta.',
      sv: 'Resten kan du visa under svaren.',
      en: 'You can show the rest below the answers.',
    })
    await click(
      openQuestion.getByRole('button', {
        name: new RegExp(`^${t('questionResults:showAllAnswers').split('{{count}}')[0]}`),
      })
    )
    await expect(contains(openQuestion, 'Viikkotehtäviä oli paljon muiden kurssien rinnalla.')).toBeVisible()
    await pause(1500)

    await caption({
      fi: 'Valmista! Uudet vastaukset tulevat näkyviin, kun lataat sivun uudelleen.',
      sv: 'Klart! Nya svar syns när du laddar om sidan.',
      en: 'Done! New answers show when you reload the page.',
    })
  }
)
