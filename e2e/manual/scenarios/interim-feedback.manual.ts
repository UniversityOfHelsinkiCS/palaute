import { byDataCy, textField } from '../../support/test'
import { expect, manualTest } from '../fixtures'
import { closeNotification, openFromMyTeaching } from '../steps'
import { teacher } from '../users'

manualTest(
  'Välipalautteen luominen',
  { annotation: { type: 'en', description: 'Creating interim feedback' } },
  async ({ page, demo, lang, loginAs, caption, click, fill, t, localize }) => {
    await demo.seed('ongoing')
    const fbtId = demo.fbtId
    await loginAs(teacher)

    await caption({
      fi: 'Tässä videossa luodaan kurssille välipalaute.',
      en: 'In this video, we create interim feedback for a course.',
    })

    await caption({
      fi: 'Välipalaute on erillinen kysely omilla kysymyksillä esimerkiksi kurssin puolivälissä.',
      en: 'Interim feedback is a separate survey with your own questions, for example halfway through the course.',
    })
    await openFromMyTeaching(page, click, caption, fbtId, 'active')

    await caption({
      fi: 'Välipalautteet ovat Välipalautteet-välilehdellä.',
      en: 'Interim feedback is in the Interim feedbacks tab.',
    })
    await click(byDataCy(page, 'feedback-target-interim-feedback-tab'))

    await caption({ fi: 'Luodaan uusi välipalaute.', en: 'Create a new interim feedback.' })
    await click(byDataCy(page, 'interim-feedbacks-add-new'))

    await caption({
      fi: 'Annetaan sille nimi. Se on oletuksena auki huomisesta alkaen viikon ajan.',
      en: 'Give it a name. By default, it is open for a week starting tomorrow.',
    })
    await fill(
      textField(page, `formik-locales-field-${lang}-name`),
      localize({
        fi: 'Välipalaute ensimmäisestä harjoituskerrasta',
        en: 'Interim feedback on the first exercise session',
      })
    )

    await caption({ fi: 'Tallennetaan välipalaute.', en: 'Save the interim feedback.' })
    await click(byDataCy(page, 'interim-feedback-editor-save'))
    await closeNotification(page, click, t('common:saveSuccess'))

    await caption({
      fi: 'Välipalautteessa ei ole yliopistotason kysymyksiä, joten lisätään omat kysymykset.',
      en: 'Interim feedback has no university-wide questions, so add your own.',
    })
    await click(byDataCy(page, 'question-editor-add-question'))

    await caption({ fi: 'Valitaan avoin kysymys.', en: 'Choose an open question.' })
    await click(byDataCy(page, 'question-editor-type-menu-select-open-question'))

    await caption({ fi: 'Kirjoitetaan kysymys.', en: 'Write the question.' })
    await fill(
      page.locator(`textarea[id^="open-question-${lang}-questions"]`),
      localize({
        fi: 'Mikä harjoituskerrassa auttoi oppimistasi?',
        en: 'What in the exercise session helped you learn?',
      })
    )

    await caption({ fi: 'Tallennetaan kysymys.', en: 'Save the question.' })
    await click(byDataCy(page, 'question-card-save-edit'))
    await expect(byDataCy(page, 'editQuestion').first()).toBeVisible()

    await caption({ fi: 'Suljetaan välipalautteen ikkuna.', en: 'Close the interim feedback window.' })
    await click(byDataCy(page, 'interim-feedback-modal-close-button'))
    await expect(page.locator('[data-cy^="interim-feedback-item-title-"]')).toHaveCount(1)

    await caption({
      fi: 'Norppa ei lähetä välipalautteesta sähköpostia, joten kerro siitä opiskelijoille itse, kun se on auki.',
      en: "Norppa sends no emails about interim feedback, so tell the students about it yourself once it's open.",
    })

    await caption({
      fi: 'Kun välipalaute on auki, opiskelijat löytävät sen Kurssipalautteeni-sivun Odottaa-välilehdeltä.',
      en: 'While the interim feedback is open, students find it on the Awaiting tab of the My feedback page.',
    })

    await caption({
      fi: 'Valmista! Välipalaute avautuu itsestään alkamispäivänään.',
      en: 'Done! The interim feedback opens by itself on its start date.',
    })
  }
)
