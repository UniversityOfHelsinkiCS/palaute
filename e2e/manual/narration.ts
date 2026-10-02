import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const TTS_URL = process.env.MANUAL_TTS_URL ?? 'http://localhost:5005'
const VOICE = process.env.MANUAL_VOICE ?? 'default'
const CACHE_DIR = path.resolve(__dirname, '.narration-cache')

type Clip = { path: string; durationMs: number }

type Narrator = {
  // Null when the voice service does not speak the language
  narrate: (text: string, lang: string) => Promise<(Clip & { cached: boolean }) | null>
}

const clipDurationMs = async (clipPath: string) => {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'csv=p=0',
    clipPath,
  ])
  return Math.round(parseFloat(stdout) * 1000)
}

const exists = (file: string) =>
  fs.access(file).then(
    () => true,
    () => false
  )

const createNarrator = async (): Promise<Narrator | null> => {
  let health: { model: string; languages: string[]; voices: string[] }
  try {
    const response = await fetch(`${TTS_URL}/health`)
    if (!response.ok) throw new Error(`Status ${response.status}`)
    health = await response.json()
  } catch {
    console.warn(`No voice service at ${TTS_URL}, recording without narration`)
    return null
  }
  if (!health.voices.includes(VOICE))
    throw new Error(`Voice ${VOICE} not found, available: ${health.voices.join(', ')}`)

  await fs.mkdir(CACHE_DIR, { recursive: true })
  // A replaced voice clip must not reuse the narration made with the old one
  const voiceAudio =
    VOICE === 'default'
      ? undefined
      : createHash('sha256')
          .update(await fs.readFile(path.resolve(__dirname, 'tts/voices', `${VOICE}.wav`)))
          .digest('hex')

  return {
    narrate: async (text, lang) => {
      if (!health.languages.includes(lang)) return null
      const key = createHash('sha256')
        .update(JSON.stringify({ model: health.model, voice: VOICE, voiceAudio, lang, text }))
        .digest('hex')
      const clipPath = path.join(CACHE_DIR, `${key}.wav`)
      const cached = await exists(clipPath)

      if (!cached) {
        const response = await fetch(`${TTS_URL}/synthesize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, lang, voice: VOICE }),
        })
        if (!response.ok) throw new Error(`Synthesis failed (${response.status}): ${await response.text()}`)
        // Write via a temp file so an interrupted run never leaves a broken clip in the cache
        await fs.writeFile(`${clipPath}.tmp`, Buffer.from(await response.arrayBuffer()))
        await fs.rename(`${clipPath}.tmp`, clipPath)
      }

      return { path: clipPath, durationMs: await clipDurationMs(clipPath), cached }
    },
  }
}

let narrator: Promise<Narrator | null> | undefined

export const getNarrator = () => (narrator ??= createNarrator())
