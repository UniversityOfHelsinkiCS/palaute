import type { Locator, Page } from '@playwright/test'

import { addDays, subDays } from 'date-fns'

import type { TestUser } from '../fixtures/headers'
import type { Api, Question } from '../support/api'
import type { Caption } from './fixtures'

import { student } from '../fixtures/headers'
import { byDataCy, expect } from '../support/test'

type Click = (locator: Locator) => Promise<void>
type Narrate = (caption: Caption) => Promise<void>

// Running courses and courses with open feedback are on the Active tab, the rest are grouped by course unit on Ended
export const findInMyTeaching = async (page: Page, click: Click, caption: Narrate, tab: 'active' | 'ended') => {
  await caption({ fi: 'Siirrytään ensin Kyselyni-sivulle yläpalkista.' })
  await click(byDataCy(page, 'navbar-links').locator('a[href="/courses"]'))

  if (tab === 'active') {
    await caption({ fi: 'Käynnissä olevat kurssit ovat Aktiiviset-välilehdellä.' })
    await click(byDataCy(page, 'my-teaching-active-tab'))
  } else {
    await caption({ fi: 'Päättyneet kurssit ovat Päättyneet-välilehdellä.' })
    await click(byDataCy(page, 'my-teaching-ended-tab'))
    await caption({ fi: 'Avataan kurssi listalta.' })
    await click(byDataCy(page, 'my-teaching-course-unit-accordion-TEST_COURSE'))
  }
}

export const openFromMyTeaching = async (
  page: Page,
  click: Click,
  caption: Narrate,
  fbtId: number,
  tab: 'active' | 'ended'
) => {
  await findInMyTeaching(page, click, caption, tab)
  await caption({ fi: 'Siirrytään kurssikyselyn sivulle valitsemalla kurssin toteutus.' })
  await click(byDataCy(page, `my-teaching-feedback-target-item-link-${fbtId}`))
}

// Notifications stay for 20 seconds over the top of the page, so close them like a user would.
// A closing notification blocks an identical new one until it is removed.
export const closeNotification = async (page: Page, click: Click, text: string) => {
  const notification = page.locator('#notistack-snackbar')
  await expect(notification).toHaveText(text)
  await click(notification.locator('xpath=..').getByRole('button'))
  await expect(notification).toHaveCount(0)
}

// A course that is still running. Feedback opens the day after it ends and stays open for two weeks, as by default.
export const ongoingCourse = () => {
  const courseEndDate = addDays(new Date(), 14)
  return {
    courseStartDate: subDays(new Date(), 60),
    courseEndDate,
    opensAt: addDays(courseEndDate, 1),
    closesAt: addDays(courseEndDate, 15),
  }
}

// The students that createFeedbackTarget's extraStudents enrols
const extraStudent = (index: number, givenname: string, sn: string): TestUser => ({
  uid: `test-extra-student-${index}`,
  hyPersonSisuId: `test-extra-student-${index}`,
  studentNumber: `0123456${index}`,
  givenname,
  sn,
  mail: `${givenname}.${sn}@example.com`.toLowerCase(),
})

const extraStudents = [
  extraStudent(0, 'Aino', 'Virtanen'),
  extraStudent(1, 'Eetu', 'Korhonen'),
  extraStudent(2, 'Sanni', 'Mäkinen'),
  extraStudent(3, 'Leevi', 'Nieminen'),
  extraStudent(4, 'Iida', 'Laine'),
]

// Seeded first, because the course seed keeps existing users and would otherwise create them without names
export const createCourseWithStudents = async (api: Api) => {
  await api.seedUsers(extraStudents)
  await api.createFeedbackTarget({ extraStudents: extraStudents.length })
}

const openAnswers = [
  'Harjoitustehtävät auttoivat ymmärtämään luentojen asiat.',
  'Luennoilla eteni välillä liian nopeasti.',
  'Hyvä ja selkeä kurssi, kiitos!',
  'Esimerkkejä voisi olla enemmän.',
  'Palautetta tehtävistä sai nopeasti.',
]

// Five answers, the fewest that shows who has given feedback
export const giveFeedbackFromStudents = async (api: Api) => {
  for (const [index, user] of [student, ...extraStudents.slice(0, 4)].entries()) {
    await api.giveFeedback(user, (question: Question) =>
      question.type === 'OPEN' ? openAnswers[index] : String(3 + ((index + question.id) % 3))
    )
  }
}
