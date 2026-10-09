import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const TTS_URL = process.env.MANUAL_TTS_URL ?? 'http://localhost:5005'
const VOICE = process.env.MANUAL_VOICE ?? 'default'
const CACHE_DIR = path.resolve(__dirname, '.narration-cache')
// A change to the service generates the clips again
const TTS_FILES = ['Dockerfile', 'pyproject.toml', 'uv.lock', 'server.py']

type Clip = { path: string; durationMs: number }

type Narrator = {
  // Without the voice service only cached clips are available
  online: boolean
  // Null when the clip is not cached and the service is not available or does not speak the language
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

const exists = async (file: string) => {
  try {
    await fs.access(file)
    return true
  } catch {
    return false
  }
}

const getHealth = async (): Promise<{
  languages: string[]
  voices: string[]
} | null> => {
  try {
    const response = await fetch(`${TTS_URL}/health`)
    if (!response.ok) throw new Error(`Status ${response.status}`)
    return await response.json()
  } catch {
    return null
  }
}

const createNarrator = async (): Promise<Narrator> => {
  const health = await getHealth()
  if (!health) console.warn(`No voice service at ${TTS_URL}, using only cached narration`)
  if (health && !health.voices.includes(VOICE))
    throw new Error(`Voice ${VOICE} not found, available: ${health.voices.join(', ')}`)

  await fs.mkdir(CACHE_DIR, { recursive: true })
  const modelHash = createHash('sha256')
  for (const file of TTS_FILES) modelHash.update(await fs.readFile(path.resolve(__dirname, 'tts', file)))
  const model = modelHash.digest('hex').slice(0, 16)
  // A replaced voice clip must not reuse the narration made with the old one
  const voiceAudio =
    VOICE === 'default'
      ? undefined
      : createHash('sha256')
          .update(await fs.readFile(path.resolve(__dirname, 'tts/voices', `${VOICE}.wav`)))
          .digest('hex')

  return {
    online: Boolean(health),
    narrate: async (text, lang) => {
      if (health && !health.languages.includes(lang)) return null
      const key = createHash('sha256')
        .update(JSON.stringify({ model, voice: VOICE, voiceAudio, lang, text }))
        .digest('hex')
      const clipPath = path.join(CACHE_DIR, `${key}.wav`)
      const cached = await exists(clipPath)

      if (!cached) {
        if (!health) return null
        const response = await fetch(`${TTS_URL}/synthesize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, lang, voice: VOICE }),
        })
        if (!response.ok) throw new Error(`Synthesis failed (${response.status}): ${await response.text()}`)
        // Write via a temp file so an interrupted run never leaves a broken clip in the cache
        await fs.writeFile(`${clipPath}.tmp`, Buffer.from(await response.arrayBuffer()))
        await fs.rename(`${clipPath}.tmp`, clipPath)
      } else {
        // Marks the clip as in use, so pruning keeps it
        await fs.utimes(clipPath, new Date(), new Date())
      }

      return {
        path: clipPath,
        durationMs: await clipDurationMs(clipPath),
        cached,
      }
    },
  }
}

let narrator: Promise<Narrator> | undefined

export const getNarrator = () => (narrator ??= createNarrator())

// Deletes the clips that no narration has used since the given time
export const pruneCache = async (sinceMs: number) => {
  let files: string[]
  try {
    files = await fs.readdir(CACHE_DIR)
  } catch {
    // No cache yet
    return
  }
  let pruned = 0
  for (const file of files) {
    const filePath = path.join(CACHE_DIR, file)
    if ((await fs.stat(filePath)).mtimeMs >= sinceMs) continue
    await fs.rm(filePath)
    pruned++
  }
  if (pruned > 0) console.log(`Pruned ${pruned} unused narration clips`)
}
