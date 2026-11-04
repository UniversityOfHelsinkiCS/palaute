import { byDataCy, textField } from '../../support/test'
import { expect, manualTest } from '../fixtures'
import { closeNotification } from '../steps'
import { teacher } from '../users'

manualTest(
  'Koulutusohjelman kyselyn luominen',
  { annotation: { type: 'en', description: 'Creating a programme survey' } },
  async ({ page, demo, lang, loginAs, caption, hover, click, fill, t, localize }) => {
    // As feedback correspondent, the teacher administers the course's programme
    await demo.seed('ongoing', { feedbackCorrespondent: true })
    await loginAs(teacher)

    await caption({
      fi: 'Tässä videossa luodaan koulutusohjelman kysely.',
      en: 'In this video, we create a programme survey.',
    })

    await caption({
      fi: 'Koulutusohjelman kysely on organisaatiotason kysely, jonka koulutusohjelma tekee itse valitsemilleen opiskelijoille, esimerkiksi lukukausipalautteeksi.',
      en: 'A programme survey is an organisation-level survey that a programme makes for the students it chooses, for example as feedback on a term.',
    })

    await caption({
      fi: 'Kyselyn voivat luoda koulutusohjelman hallinnoijat, kuten palautevastaavat ja koulutusohjelmajohtaja.',
      en: "The programme's administrators, like the feedback correspondents and the programme director, can create one.",
    })
    await click(page.getByRole('link', { name: t('navBar:myOrganisations'), exact: true }))
    await click(page.getByRole('link', { name: /KH50_005/ }))

    await caption({ fi: 'Avataan Koulutusohjelman kyselyt -välilehti.', en: 'Open the Programme surveys tab.' })
    await click(page.locator('#tab-organisation-surveys'))

    await caption({ fi: 'Valitaan Luo uusi koulutusohjelman kysely.', en: 'Choose Create new programme survey.' })
    await click(byDataCy(page, 'organisation-surveys-add-new'))
    const dialog = page.getByRole('dialog')

    await caption({ fi: 'Annetaan kyselylle nimi.', en: 'Give the survey a name.' })
    await fill(
      textField(page, `formik-locales-field-${lang}-name`),
      localize({ fi: 'Syyslukukauden palaute', en: 'Feedback on the autumn term' })
    )

    await caption({
      fi: 'Kysely on oletuksena auki huomisesta alkaen viikon ajan. Se voi olla auki niin kauan kuin haluat.',
      en: 'By default, the survey is open for a week starting tomorrow. It can be open for as long as you want.',
    })
    await hover(byDataCy(page, 'formik-date-picker-field-startDate'))

    await caption({
      fi: 'Kyselyn ylläpitäjänä määrittelet sen roolit. Olet itse jo vastuuhenkilö, ja muita voi hakea nimellä tai sähköpostiosoitteella.',
      en: "As the survey's maintainer, you set its roles. You are already a responsible person, and others can be searched by name or email address.",
    })
    await hover(byDataCy(page, 'formik-responsible-teacher-input'))

    await caption({
      fi: 'Vastaajiksi voi lisätä opiskelijoita opiskelijanumeroilla tai kursseilta.',
      en: 'Students can be added as respondents by their student numbers or from courses.',
    })
    await hover(textField(page, 'formik-student-number-input-field'))

    await caption({
      fi: 'Lisätään koulutusohjelman kurssin opiskelijat. Kurssin kohdalla näkyy sen opiskelijamäärä.',
      en: "Add the students of one of the programme's courses. Each course shows its number of students.",
    })
    await fill(
      dialog.getByRole('combobox', { name: t('organisationSurveys:addCourses') }),
      localize({ fi: 'Ohjelmoinnin', en: 'Introduction' })
    )
    await click(page.getByRole('option').first())
    // The list stays open for choosing more courses
    await page.keyboard.press('Escape')
    await expect(page.getByRole('listbox')).toBeHidden()
    await expect(dialog.locator('[data-cy^="formik-course-input-field-chip-"]')).toHaveCount(1)

    await caption({
      fi: 'Tallennetaan kysely. Kurssin opiskelijat kopioidaan kyselyyn tallennettaessa, joten myöhemmin ilmoittautuneet lisätään tallentamalla kysely uudelleen.',
      en: "Save the survey. The course's students are copied to the survey when it's saved, so students who enrol later are added by saving it again.",
    })
    await click(byDataCy(page, 'organisation-survey-editor-save'))
    // The notification also tells that the course's students are not updated by themselves
    await closeNotification(page, click, new RegExp(`^${t('common:saveSuccess')}`))

    await caption({
      fi: 'Norppa avasi kyselyn Kysymykset-välilehden. Kyselyssä ei ole oletusarvoisesti yliopistotason kysymyksiä, mutta voit halutessasi lisätä ne tai omat kysymyksesi.',
      en: "Norppa opened the Questions tab of the survey. It has no university-wide questions by default, but you're entitled to add them or your own custom ones.",
    })
    await click(byDataCy(page, 'question-editor-add-question'))

    await caption({ fi: 'Valitaan avoin kysymys.', en: 'Choose an open question.' })
    await click(byDataCy(page, 'question-editor-type-menu-select-open-question'))

    await caption({ fi: 'Kirjoitetaan kysymys.', en: 'Write the question.' })
    await fill(
      page.locator(`textarea[id^="open-question-${lang}-questions"]`),
      localize({
        fi: 'Mikä syyslukukaudella sujui hyvin?',
        en: 'What went well in the autumn term?',
      })
    )

    await caption({ fi: 'Tallennetaan kysymys.', en: 'Save the question.' })
    await click(byDataCy(page, 'question-card-save-edit'))
    await expect(byDataCy(page, 'editQuestion').first()).toBeVisible()

    await caption({
      fi: 'Norppa ei lähetä koulutusohjelman kyselystä automaattista sähköpostimuistutusta, joten lähetä opiskelijoille muistutusviesti tai jaa kyselyn linkki, kun se on auki.',
      en: "Norppa sends no automatic emails about the programme survey, so send the students a reminder or share the survey's link once it's open.",
    })

    await caption({
      fi: 'Valmista! Kysely avautuu itsestään alkamispäivänään, ja vastuuhenkilöt löytävät sen Kyselyni-sivulta.',
      en: 'Done! The survey opens by itself on its start date, and the responsible persons find it on the My surveys page.',
    })
  }
)
