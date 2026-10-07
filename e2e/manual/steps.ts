import type { Locator, Page } from '@playwright/test'

import type { Caption } from './fixtures'

import { byDataCy, expect } from '../support/test'
import { COURSE_CODE } from './demo'

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
    await click(byDataCy(page, `my-teaching-course-unit-accordion-${COURSE_CODE}`))
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
