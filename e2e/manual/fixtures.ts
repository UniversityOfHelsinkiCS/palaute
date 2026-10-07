import type { Locator, Page } from '@playwright/test'

import fs from 'node:fs/promises'
import path from 'node:path'

import { expect, test } from '../support/test'
import { createDemo, type Demo } from './demo'
import { getNarrator } from './narration'
import { encodeVideo, type PlacedClip } from './output'
import { CURTAIN_FADE_MS, installOverlay, showCaption, showCurtain } from './overlay'

export type Language = 'fi' | 'sv' | 'en'
export type Caption = { fi: string; sv?: string; en?: string }

export type ManualOptions = { lang: Language }

type Recording = {
  startedAt: number
  speakingUntil: number
  // Ms from the start, null before the first caption
  firstCaptionMs: number | null
  clips: PlacedClip[]
}

type ManualFixtures = {
  demo: Demo
  recording: Recording
  caption: (text: Caption, minMs?: number) => Promise<void>
  click: (locator: Locator) => Promise<void>
  fill: (locator: Locator, text: string) => Promise<void>
  scrollTo: (locator: Locator) => Promise<void>
  pause: (ms?: number) => Promise<void>
  // Covers changes the viewer should not see, like seeding data, with a card telling what happens meanwhile.
  curtain: (text: Caption, change: () => Promise<void>) => Promise<void>
}

// The narration pass only generates the voice clips, so the record pass never waits on them
const narrationPass = process.env.MANUAL_PASS === 'narrate'

const STEP_DELAY = 600
const TYPE_DELAY = 60
const CURSOR_MOVE_MS = 500
const CURSOR_STEPS = 18
const MIN_CAPTION_MS = 1600
const CAPTION_MS_PER_CHAR = 60
const NARRATION_GAP_MS = 600
// How far into a caption the action starts, so the viewer hears what is about to happen first
const CAPTION_LEAD_MS = 1000
// Kept before the first caption when the page load at the start is cut off
const INTRO_MS = 500
const OUTRO_MS = 1200
const SETTLE_MS = 1500
const SCROLL_MS = 900
// Share of the screen height at the top and bottom where an action is scrolled to the middle first
const SCREEN_EDGE = 0.25

// The browser would only scroll an element just inside the edge of the screen, away from the viewer's focus
const centerOnScreen = async (page: Page, locator: Locator) => {
  await locator.waitFor()
  const box = await locator.boundingBox()
  const height = page.viewportSize()?.height
  if (!box || !height) return
  const center = box.y + box.height / 2
  if (center > height * SCREEN_EDGE && center < height * (1 - SCREEN_EDGE)) return

  await locator.evaluate(element => element.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  // Elements that cannot scroll, like the navbar, stay put and need no wait
  let previous = box
  for (let waited = 0; waited < SCROLL_MS * 2; waited += 100) {
    await page.waitForTimeout(100)
    const current = await locator.boundingBox()
    if (!current || current.y === previous.y) break
    previous = current
  }
}

const CURTAIN_MIN_MS = 2000
// Lets the viewer see what changed before the video continues
const AFTER_CURTAIN_MS = 500

// index.html loads Open Sans from Google Fonts, without it the videos would show a fallback font
const FONT_ORIGINS = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com']

const readingTime = (text: string) => Math.max(MIN_CAPTION_MS, text.length * CAPTION_MS_PER_CHAR)

export const manualTest = test.extend<ManualOptions & ManualFixtures>({
  lang: ['fi', { option: true }],

  // Each scenario seeds the demo data itself
  // eslint-disable-next-line no-empty-pattern -- Playwright requires the destructuring
  resetDb: async ({}, use) => {
    await use()
  },

  // The UI language comes from the seeded users
  demo: async ({ request, lang }, use) => {
    await use(createDemo(request, lang))
  },

  // Fails the video if the browser talks to anything but the local app, like Sentry or another real service
  page: async ({ page, baseURL }, use) => {
    const appOrigin = new URL(baseURL!).origin
    const blocked: string[] = []
    await page.route('**/*', route => {
      const request = route.request()
      const { origin } = new URL(request.url())
      if (origin === appOrigin || (request.method() === 'GET' && FONT_ORIGINS.includes(origin))) return route.continue()
      blocked.push(`${request.method()} ${request.url()}`)
      return route.abort('blockedbyclient')
    })
    await use(page)
    expect(blocked).toEqual([])
  },

  recording: [
    async ({ page, lang }, use, testInfo) => {
      await installOverlay(page)
      const recording: Recording = {
        startedAt: Date.now(),
        speakingUntil: 0,
        firstCaptionMs: null,
        clips: [],
      }

      await use(recording)

      if (!narrationPass) await page.waitForTimeout(Math.max(0, recording.speakingUntil - Date.now()) + OUTRO_MS)
      const video = page.video()
      // Cut the blank page and loading before the first caption
      const trimMs = Math.max(0, (recording.firstCaptionMs ?? 0) - INTRO_MS)
      await page.close()
      if (narrationPass || !video || testInfo.status !== testInfo.expectedStatus) return

      const clips = recording.clips.map(clip => ({
        ...clip,
        offsetMs: clip.offsetMs - trimMs,
      }))

      const dir = path.resolve(testInfo.project.testDir, '../videos', lang)
      const slug = path.basename(testInfo.file, '.manual.ts')
      await fs.mkdir(dir, { recursive: true })
      const webmPath = path.join(dir, `${slug}.webm`)
      await video.saveAs(webmPath)
      const videoPath = await encodeVideo(webmPath, clips, trimMs)
      console.log(`Saved ${path.relative(process.cwd(), videoPath)}`)
    },
    { auto: true },
  ],

  caption: async ({ page, lang, recording }, use) => {
    await use(async (caption, minMs = 0) => {
      const text = caption[lang] ?? caption.fi
      if (!caption[lang]) console.warn(`No ${lang} caption, using fi: ${caption.fi}`)

      const narrator = await getNarrator()
      const clip = await narrator?.narrate(text, lang)
      if (narrationPass) return
      if (clip && !clip.cached) console.warn(`Narration was not pre-generated, the video freezes here: ${text}`)

      // The video starts just before the first caption, so the page must have finished rendering by then.
      // This wait is cut out of the video.
      if (recording.firstCaptionMs === null) {
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(SETTLE_MS)
      }
      // Actions run while a caption is spoken, but the next caption waits for the previous one to finish
      await page.waitForTimeout(Math.max(0, recording.speakingUntil + NARRATION_GAP_MS - Date.now()))
      const startMs = Date.now() - recording.startedAt
      recording.firstCaptionMs ??= startMs
      if (clip) recording.clips.push({ path: clip.path, offsetMs: startMs })
      await showCaption(page, text)
      recording.speakingUntil = Date.now() + (clip ? clip.durationMs : readingTime(text))
      await page.waitForTimeout(Math.max(minMs, CAPTION_LEAD_MS))
    })
  },

  click: async ({ page }, use) => {
    let cursor = { x: 0, y: 0 }

    await use(async locator => {
      if (narrationPass) return locator.click()
      await moveTo(locator)
      await locator.click()
      await page.waitForTimeout(STEP_DELAY)
    })

    async function moveTo(locator: Locator) {
      await centerOnScreen(page, locator)
      const box = await locator.boundingBox()
      if (!box) throw new Error('Element has no bounding box, is it visible?')
      const target = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
      for (let step = 1; step <= CURSOR_STEPS; step++) {
        const progress = step / CURSOR_STEPS
        await page.mouse.move(cursor.x + (target.x - cursor.x) * progress, cursor.y + (target.y - cursor.y) * progress)
        await page.waitForTimeout(CURSOR_MOVE_MS / CURSOR_STEPS)
      }
      cursor = target
      await page.waitForTimeout(150)
    }
  },

  fill: async ({ page, click }, use) => {
    await use(async (locator, text) => {
      if (narrationPass) return locator.fill(text)
      await click(locator)
      await locator.pressSequentially(text, { delay: TYPE_DELAY })
      await page.waitForTimeout(STEP_DELAY)
    })
  },

  scrollTo: async ({ page }, use) => {
    await use(async locator => {
      if (narrationPass) return locator.scrollIntoViewIfNeeded()
      await locator.evaluate(element => element.scrollIntoView({ behavior: 'smooth', block: 'center' }))
      await page.waitForTimeout(SCROLL_MS)
    })
  },

  curtain: async ({ page, lang, recording }, use) => {
    await use(async (text, change) => {
      if (narrationPass) return change()
      // A quiet pause between the scenes, so the caption before it is finished and removed first
      await page.waitForTimeout(Math.max(0, recording.speakingUntil + NARRATION_GAP_MS - Date.now()))
      await showCaption(page, '')
      const shownAt = Date.now()
      await showCurtain(page, text[lang] ?? text.fi)
      await page.waitForTimeout(CURTAIN_FADE_MS)
      await change()
      await page.waitForTimeout(Math.max(STEP_DELAY, shownAt + CURTAIN_MIN_MS - Date.now()))
      await showCurtain(page, null)
      await page.waitForTimeout(CURTAIN_FADE_MS + AFTER_CURTAIN_MS)
    })
  },

  pause: async ({ page }, use) => {
    await use(async (ms = STEP_DELAY) => {
      if (!narrationPass) await page.waitForTimeout(ms)
    })
  },
})

export { expect } from '../support/test'
