import { spawnSync } from 'node:child_process'

import { getNarrator, pruneCache } from './narration'

const filters = process.argv.slice(2)

const playwright = (pass: 'narrate' | 'record') => {
  const args = ['playwright', 'test', '-c', 'playwright.manual.config.ts', ...filters]
  const { status } = spawnSync('npx', args, {
    stdio: 'inherit',
    env: { ...process.env, MANUAL_PASS: pass },
  })
  if (status !== 0) process.exit(status ?? 1)
}

// Kept for a while, so switching back to another voice or an earlier caption does not generate them again
const UNUSED_CLIP_KEEP_MS = 7 * 24 * 60 * 60 * 1000

const main = async () => {
  const keepSince = Date.now() - UNUSED_CLIP_KEEP_MS
  // Synthesizing during the recording would freeze the video, so generate all narration first
  const narrated = Boolean(await getNarrator())
  if (narrated) playwright('narrate')
  playwright('record')
  // A filtered run only uses some of the clips, so only a full run knows which are unused
  if (narrated && filters.length === 0) await pruneCache(keepSince)
}

void main()
