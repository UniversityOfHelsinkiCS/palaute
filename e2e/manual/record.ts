import { spawnSync } from 'node:child_process'

import { getNarrator } from './narration'

const playwright = (pass: 'narrate' | 'record') => {
  const args = ['playwright', 'test', '-c', 'playwright.manual.config.ts', ...process.argv.slice(2)]
  const { status } = spawnSync('npx', args, {
    stdio: 'inherit',
    env: { ...process.env, MANUAL_PASS: pass },
  })
  if (status !== 0) process.exit(status ?? 1)
}

const main = async () => {
  // Synthesizing during the recording would freeze the video, so generate all narration first
  if (await getNarrator()) playwright('narrate')
  playwright('record')
}

void main()
