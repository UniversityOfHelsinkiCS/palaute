import { byDataCy } from '../../support/test'
import { expect, manualTest } from '../fixtures'
import { teacher } from '../users'

manualTest(
  'Kurssiyhteenvedon lataaminen',
  {
    annotation: [
      { type: 'sv', description: 'Ladda ner kurssammanfattningen' },
      { type: 'en', description: 'Downloading the course summary' },
    ],
  },
  async ({ page, demo, loginAs, caption, click, t }) => {
    await demo.seed('feedbackClosed', { feedback: true })
    await loginAs(teacher)

    await caption({
      fi: 'Tässä videossa ladataan kurssiyhteenvedon luvut taulukkona.',
      sv: 'I den här videon laddar vi ner kurssammanfattningens siffror som ett kalkylark.',
      en: 'In this video, we download the figures of the course summary as a spreadsheet.',
    })

    // Clicking the navbar link while already on the page empties it, so start from the page login opens
    await caption({
      fi: 'Kurssiyhteenveto avautuu ylävalikosta. Valitse ensin ajanjakso.',
      sv: 'Kurssammanfattningen öppnas från den övre menyn. Välj först perioden.',
      en: 'The course summary opens from the top bar. First, choose the period.',
    })
    await expect(byDataCy(page, 'navbar-links').locator('a[href="/course-summary"]')).toBeVisible()

    await caption({ fi: 'Valitaan Lataa XLSX.', sv: 'Välj Exportera som XLSX.', en: 'Choose Download XLSX.' })
    await click(page.getByRole('button', { name: t('common:exportXLSX') }))
    const dialog = page.getByRole('dialog')

    await caption({
      fi: 'Valitaan, mitä tiedostoon tulee. Kukin tulee omalle välilehdelleen.',
      sv: 'Välj vad som ska ingå i filen. Varje del hamnar på ett eget blad.',
      en: 'Choose what goes in the file. Each goes on its own sheet.',
    })
    await click(dialog.getByRole('checkbox', { name: t('generateReport:courseUnits') }))
    await click(dialog.getByRole('checkbox', { name: t('generateReport:courseRealisations') }))

    await caption({ fi: 'Ladataan tiedosto.', sv: 'Ladda ner filen.', en: 'Download the file.' })
    const download = page.waitForEvent('download')
    await click(byDataCy(page, 'export-xlsx-submit'))
    expect((await download).suggestedFilename()).toMatch(/\.xlsx$/)

    await caption({
      fi: 'Valmista! Tiedosto on ladattu.',
      sv: 'Klart! Filen har laddats ner.',
      en: 'Done! The file has been downloaded.',
    })
  }
)
