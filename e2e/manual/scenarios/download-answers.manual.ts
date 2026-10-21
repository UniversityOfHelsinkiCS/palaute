import { byDataCy } from '../../support/test'
import { expect, manualTest } from '../fixtures'
import { openFromMyTeaching } from '../steps'
import { teacher } from '../users'

manualTest(
  'Vastausten lataaminen',
  { annotation: { type: 'en', description: 'Downloading the answers' } },
  async ({ page, demo, loginAs, caption, click, pause, t }) => {
    await demo.seed('feedbackOpen', { feedback: true })
    const fbtId = demo.fbtId
    await loginAs(teacher)

    await caption({
      fi: 'Tässä videossa ladataan kyselyn vastaukset tiedostona.',
      en: "In this video, we download a survey's answers as a file.",
    })

    await openFromMyTeaching(page, click, caption, fbtId, 'active')

    await caption({ fi: 'Avataan Vastaukset-välilehti.', en: 'Open the Answers tab.' })
    await click(byDataCy(page, 'feedback-target-results-tab'))

    await caption({
      fi: 'Vastaukset ladataan Lataa palaute -valikosta.',
      en: 'The answers are downloaded from the Download feedback menu.',
    })
    await click(page.getByRole('button', { name: t('feedbackTargetResults:export') }))

    await caption({
      fi: 'Lataa pdf avaa selaimen tulostusnäkymän, jossa välilehden voi tallentaa pdf-tiedostoksi.',
      en: "Download PDF opens the browser's print view, where you can save the tab as a PDF file.",
    })
    await pause(1500)

    await caption({
      fi: 'Ladataan XLSX-taulukko. Siinä on sarake kullekin kysymykselle.',
      en: 'Download the XLSX spreadsheet. It has a column for each question.',
    })
    const download = page.waitForEvent('download')
    await click(page.getByRole('menuitem', { name: t('common:exportXLSX') }))
    expect((await download).suggestedFilename()).toMatch(/\.xlsx$/)

    await caption({
      fi: 'Valmista! Jotta yksittäistä vastaajaa ei voi tunnistaa, vastaukset on sekoitettu sarakkeittain, joten rivi ei ole yhden opiskelijan vastaukset.',
      en: "Done! So that no single respondent can be identified, each column's answers are shuffled, so a row is not one student's answers.",
    })
  }
)
