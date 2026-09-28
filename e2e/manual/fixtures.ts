import type { Locator } from '@playwright/test'

import fs from 'node:fs/promises'
import path from 'node:path'

import { testUsers } from '../fixtures/headers'
import { test } from '../support/test'
import { convertToMp4, writeVtt, type Cue } from './output'
import { installOverlay, showCaption } from './overlay'

export type Language = 'fi' | 'sv' | 'en'
export type Caption = { fi: string; sv?: string; en?: string }

export type ManualOptions = { lang: Language }

type Recording = { startedAt: number; cues: Cue[] }

type ManualFixtures = {
  recording: Recording
  caption: (text: Caption, minMs?: number) => Promise<void>
  click: (locator: Locator) => Promise<void>
  fill: (locator: Locator, text: string) => Promise<void>
  pause: (ms?: number) => Promise<void>
}

const STEP_DELAY = 700
const TYPE_DELAY = 45
const MIN_CAPTION_MS = 1600
const CAPTION_MS_PER_CHAR = 60

// Voice-over will replace this with the length of the spoken clip
const captionDuration = (text: string) => Math.max(MIN_CAPTION_MS, text.length * CAPTION_MS_PER_CHAR)

export const manualTest = test.extend<ManualOptions & ManualFixtures>({
  lang: ['fi', { option: true }],

  // The UI language comes from the seeded user, which is only created once per reset
  resetDb: async ({ api, lang }, use) => {
    await api.resetDb()
    await api.seedUsers(testUsers.map(user => ({ ...user, preferredLanguage: lang })))
    await use()
  },

  recording: [
    async ({ page, lang }, use, testInfo) => {
      await installOverlay(page)
      const recording: Recording = { startedAt: Date.now(), cues: [] }

      await use(recording)

      const video = page.video()
      const endMs = Date.now() - recording.startedAt
      await page.close()
      if (!video || testInfo.status !== testInfo.expectedStatus) return

      const dir = path.resolve(testInfo.project.testDir, '../videos', lang)
      const slug = path.basename(testInfo.file, '.manual.ts')
      await fs.mkdir(dir, { recursive: true })
      const webmPath = path.join(dir, `${slug}.webm`)
      await video.saveAs(webmPath)
      await writeVtt(path.join(dir, `${slug}.vtt`), recording.cues, endMs)
      const videoPath = await convertToMp4(webmPath)
      console.log(`Saved ${path.relative(process.cwd(), videoPath)}`)
    },
    { auto: true },
  ],

  caption: async ({ page, lang, recording }, use) => {
    await use(async (caption, minMs = 0) => {
      const text = caption[lang] ?? caption.fi
      if (!caption[lang]) console.warn(`No ${lang} caption, using fi: ${caption.fi}`)
      recording.cues.push({ startMs: Date.now() - recording.startedAt, text })
      await showCaption(page, text)
      await page.waitForTimeout(Math.max(minMs, captionDuration(text)))
    })
  },

  click: async ({ page }, use) => {
    await use(async locator => {
      await moveTo(locator)
      await locator.click()
      await page.waitForTimeout(STEP_DELAY)
    })

    async function moveTo(locator: Locator) {
      await locator.scrollIntoViewIfNeeded()
      const box = await locator.boundingBox()
      if (!box) throw new Error('Element has no bounding box, is it visible?')
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 18 })
      await page.waitForTimeout(150)
    }
  },

  fill: async ({ page, click }, use) => {
    await use(async (locator, text) => {
      await click(locator)
      await locator.pressSequentially(text, { delay: TYPE_DELAY })
      await page.waitForTimeout(STEP_DELAY)
    })
  },

  pause: async ({ page }, use) => {
    await use((ms = STEP_DELAY) => page.waitForTimeout(ms))
  },
})

export { expect } from '../support/test'
