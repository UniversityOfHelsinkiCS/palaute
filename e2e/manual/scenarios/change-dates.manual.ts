import { addDays, format, startOfDay } from 'date-fns'

import { byDataCy } from '../../support/test'
import { expect, manualTest } from '../fixtures'
import { closeNotification, openFromMyTeaching } from '../steps'
import { teacher } from '../users'

manualTest(
  'Kyselyn päivämäärien muuttaminen',
  { annotation: { type: 'en', description: 'Changing the survey dates' } },
  async ({ page, demo, loginAs, caption, click, t }) => {
    const course = await demo.seed('ongoing')
    const fbtId = demo.fbtId
    await loginAs(teacher)

    await caption({
      fi: 'Tässä videossa muutetaan kurssikyselyn päivämääriä ja avataan kysely heti.',
      en: 'In this video, we change the dates of a course survey and open it right away.',
    })

    await openFromMyTeaching(page, click, caption, fbtId, 'active')

    await caption({
      fi: 'Kysely avautuu oletuksena kurssin päätyttyä ja on auki kaksi viikkoa.',
      en: 'By default, the survey opens after the course ends and stays open for two weeks.',
    })

    await caption({
      fi: 'Päivämääriä muutetaan Palaute käynnissä -kohdan Muokkaa-painikkeella.',
      en: 'The dates are changed with the Edit button next to Feedback open.',
    })
    await click(byDataCy(page, 'feedback-target-edit-period'))
    const dialog = page.getByRole('dialog', { name: t('feedbackTargetSettings:editPeriodTitle') })

    await caption({
      fi: 'Valitaan kalenterista uusi sulkeutumispäivä. Kyselyn on oltava auki vähintään vuorokauden.',
      en: 'Choose a new closing date from the calendar. The survey must be open for at least a day.',
    })
    // A week longer than by default, the calendar opens on the current closing month
    const closesAt = addDays(course.closesAt, 7)
    const calendar = page.locator('.MuiPickersPopper-paper')
    const day = calendar.locator(`[data-timestamp="${startOfDay(closesAt).getTime()}"]`)
    const settled = () =>
      calendar.evaluate(element =>
        Promise.all(element.getAnimations({ subtree: true }).map(animation => animation.finished))
      )
    // A click while the calendar is still moving into place closes it without picking the day
    await expect(async () => {
      if (!(await calendar.isVisible())) await click(byDataCy(page, 'formik-date-picker-field-closesAt-popper'))
      await settled()
      if (!(await day.isVisible())) {
        await click(calendar.locator('.MuiPickersArrowSwitcher-nextIconButton'))
        await settled()
      }
      await click(day)
      await expect(byDataCy(page, 'formik-date-picker-field-closesAt-input')).toHaveValue(
        format(closesAt, 'dd/MM/yyyy'),
        { timeout: 1000 }
      )
    }).toPass({ timeout: 20_000 })

    await caption({ fi: 'Tallennetaan muutos.', en: 'Save the change.' })
    await click(dialog.getByRole('button', { name: t('common:save') }))
    await closeNotification(page, click, t('common:saveSuccess'))

    await caption({
      fi: 'Kyselyn voi myös avata heti. Avataan muokkausikkuna uudelleen.',
      en: 'You can also open the survey right away. Open the dialog again.',
    })
    await click(byDataCy(page, 'feedback-target-edit-period'))

    await caption({
      fi: 'Valitaan Avaa palaute heti. Lisää omat kysymyksesi ensin, sillä auenneen kyselyn kysymyksiä ei voi enää muuttaa.',
      en: 'Choose Open feedback now. Add your own questions first, as they cannot be changed once the survey is open.',
    })
    await click(byDataCy(page, 'feedback-target-open-feedback-immediately'))

    await caption({
      fi: 'Vahvistetaan avaaminen. Opiskelijat saavat kyselyn linkin heti sähköpostiinsa.',
      en: 'Confirm. The students get the link to the survey by email right away.',
    })
    await click(byDataCy(page, 'feedback-target-open-feedback-immediately-confirm'))
    await expect(dialog).toBeHidden()

    await caption({
      fi: 'Valmista! Kysely on nyt auki, ja opiskelijat voivat vastata siihen.',
      en: 'Done! The survey is now open, and students can answer it.',
    })
  }
)
