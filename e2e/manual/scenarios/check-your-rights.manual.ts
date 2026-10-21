import { byDataCy } from '../../support/test'
import { expect, manualTest } from '../fixtures'
import { openFromMyTeaching } from '../steps'
import { colleagues, teacher } from '../users'

manualTest(
  'Omien oikeuksien tarkistaminen',
  { annotation: { type: 'en', description: 'Checking your rights' } },
  async ({ page, demo, loginAs, caption, hover, click, pause, t }) => {
    await demo.seed('ongoing', { feedbackCorrespondent: true })
    const fbtId = demo.fbtId
    await loginAs(teacher)

    await caption({
      fi: 'Tässä videossa tarkistetaan omat roolit kursseilla ja oikeudet koulutusohjelmiin.',
      en: 'In this video, we check our roles on courses and our rights to degree programmes.',
    })

    await caption({
      fi: 'Roolisi kurssilla tulee Sisusta. Se näkyy kurssin sivulla.',
      en: 'Your role on a course comes from Sisu. It shows on the course page.',
    })
    await openFromMyTeaching(page, click, caption, fbtId, 'active')

    await caption({
      fi: 'Kurssin opettajat näkyvät rooleittain otsikoiden Vastuuopettajat, Opettajat ja Hallintohenkilöt alla. Avataan kaikki listat.',
      en: "The course's teachers are listed by role under the headings Responsible teachers, Teachers and Administrative persons. Open all the lists.",
    })
    await click(byDataCy(page, 'feedback-target-teacher-list').getByRole('button'))
    await click(byDataCy(page, 'feedback-target-responsible-administrative-person-list').getByRole('button'))
    await expect(byDataCy(page, 'feedback-target-teacher-list')).toContainText(colleagues.teacher.sn)

    await caption({
      fi: 'Jos nimesi on otsikon Vastuuopettajat alla, voit muokata kyselyä ja kirjoittaa vastapalautteen.',
      en: 'If your name is under Responsible teachers, you can edit the survey and write counter feedback.',
    })
    await hover(byDataCy(page, 'feedback-target-responsible-teacher-list'))

    await caption({
      fi: 'Hallintohenkilöillä on samat oikeudet. Koulutusohjelman kyselyssä tämän otsikon alla ovat kyselyn vastuuhenkilöt.',
      en: "Administrative persons have the same rights. In a programme's survey, the persons responsible for it are under this heading.",
    })
    await hover(byDataCy(page, 'feedback-target-responsible-administrative-person-list'))

    await caption({
      fi: 'Jos nimesi on otsikon Opettajat alla, näet kyselyn ja sen julkiset vastaukset, mutta et voi muokata kyselyä etkä kirjoittaa vastapalautetta.',
      en: 'If your name is under Teachers, you see the survey and its public answers, but cannot edit the survey or write counter feedback.',
    })
    await hover(byDataCy(page, 'feedback-target-teacher-list'))

    await caption({
      fi: 'Oikeudet koulutusohjelmiin ja tiedekuntiin näet nimesi alta oikeasta yläkulmasta.',
      en: 'Your rights to degree programmes and faculties are under your name in the top right corner.',
    })
    await click(page.getByRole('button', { name: `${teacher.givenname} ${teacher.sn}` }))

    await caption({ fi: 'Valitaan Omat tietoni.', en: 'Choose My information.' })
    await click(page.getByRole('menuitem', { name: t('navBar:userInformation') }))
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    await caption({
      fi: 'Ikkunassa näkyvät Norppaan vaikuttavat IAM-ryhmäsi ja oikeutesi organisaatioihin koodeittain.',
      en: 'The window shows your IAM groups that affect Norppa and your rights to organisations by their codes.',
    })

    await caption({
      fi: 'Koodin vieressä on oikeutesi, Admin tai Read. Esimerkiksi koulutusohjelman palautevastaava saa siihen admin-oikeudet. Nimi näkyy, kun viet hiiren koodin päälle.',
      en: "Next to the code is your right, Admin or Read. For example, a programme's feedback liaison gets admin rights to it. The name shows when you hover over the code.",
    })
    await hover(dialog.getByText('KH50_005'))
    await pause(1500)

    await caption({
      fi: 'Valmista! Väärä rooli kurssilla korjataan Sisussa, ja puuttuvia oikeuksia pyydetään koulutusohjelman hallinnolta.',
      en: "Done! A wrong course role is fixed in Sisu, and missing rights are asked from the programme's administration.",
    })
  }
)
