import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const TTS_URL = process.env.MANUAL_TTS_URL ?? 'http://localhost:5005'
const VOICE = process.env.MANUAL_VOICE ?? 'default'
const getVoiceVersion = async () => {
  const compose = await fs.readFile(path.resolve(__dirname, '../../docker-compose.manual.yml'), 'utf8')
  const version = compose.match(/guide-video-voice:([^\s@]+)/)?.[1]
  if (!version) throw new Error('No guide-video-voice version in docker-compose.manual.yml')
  return version
}
const CACHE_DIR = path.resolve(__dirname, '.narration-cache')

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

// ffprobe reads the duration from the end of the file, only decoding all of it finds a damaged page in the middle
const isIntact = async (clipPath: string) => {
  try {
    const { stderr } = await execFileAsync('ffmpeg', ['-v', 'error', '-i', clipPath, '-f', 'null', '-'])
    return stderr === ''
  } catch {
    return false
  }
}

// Opus is a tenth of the WAV the service returns, which keeps the cache in the registry small
const toOpus = async (wavPath: string, clipPath: string) => {
  // Via a temp file, so an interrupted run never leaves a broken clip in the cache
  await execFileAsync('ffmpeg', [
    '-y',
    '-v',
    'error',
    '-i',
    wavPath,
    '-c:a',
    'libopus',
    '-b:a',
    '48k',
    '-f',
    'opus',
    `${clipPath}.tmp`,
  ])
  await fs.rename(`${clipPath}.tmp`, clipPath)
  await fs.rm(wavPath)
}

const SYNTHESIZE_ATTEMPTS = 3
const SYNTHESIZE_RETRY_MS = 10_000

// A dropped connection or a server error would otherwise fail the whole scenario, so retry them
const synthesize = async (text: string, lang: string) => {
  for (let attempt = 1; ; attempt++) {
    const last = attempt === SYNTHESIZE_ATTEMPTS
    let response: Response
    try {
      response = await fetch(`${TTS_URL}/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang, voice: VOICE }),
      })
    } catch (error) {
      if (last) throw error
      console.warn(`Synthesis attempt ${attempt} failed, retrying: ${(error as Error).message}`)
      await new Promise(resolve => setTimeout(resolve, SYNTHESIZE_RETRY_MS))
      continue
    }
    if (response.ok) return Buffer.from(await response.arrayBuffer())
    const message = `Synthesis failed (${response.status}): ${await response.text()}`
    // A bad request fails the same way every time
    if (response.status < 500 || last) throw new Error(message)
    console.warn(`Synthesis attempt ${attempt} failed, retrying: ${message}`)
    await new Promise(resolve => setTimeout(resolve, SYNTHESIZE_RETRY_MS))
  }
}

// Abbreviations the voice would read as a word are spelled out, the caption keeps them as they are
const SPELLED_OUT: Record<string, [RegExp, string][]> = {
  fi: [
    [/\bXLSX\b/g, 'äks-äl-äs-äks'],
    [/\bpdf\b/gi, 'pee-dee-äf'],
    [/\bIAM\b/g, 'I-A-M'],
    [/\bQR\b/g, 'kuu-är'],
    // Otherwise it's read in past tense
    [/\bRead\b/g, 'riid'],
  ],
  en: [
    [/\bXLSX\b/g, 'X L S X'],
    [/\bIAM\b/g, 'I A M'],
    [/\bQR\b/g, 'Q R'],
  ],
}

const toSpeech = (text: string, lang: string) =>
  (SPELLED_OUT[lang] ?? []).reduce((speech, [abbreviation, letters]) => speech.replace(abbreviation, letters), text)

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
  // Null in a locally built image
  version: string | null
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
  // Clips are cached by the version, so a new one generates them all again
  const voiceVersion = await getVoiceVersion()
  if (health?.version && health.version !== voiceVersion)
    throw new Error(`The voice service is ${health.version}, but docker-compose.manual.yml has ${voiceVersion}`)

  await fs.mkdir(CACHE_DIR, { recursive: true })

  return {
    online: Boolean(health),
    narrate: async (caption, lang) => {
      if (health && !health.languages.includes(lang)) return null
      const text = toSpeech(caption, lang)
      const key = createHash('sha256')
        .update(JSON.stringify({ voiceVersion, voice: VOICE, lang, text }))
        .digest('hex')
      const clipPath = path.join(CACHE_DIR, `${key}.opus`)
      // Clips were WAV before
      const wavPath = path.join(CACHE_DIR, `${key}.wav`)
      if (!(await exists(clipPath)) && (await exists(wavPath))) await toOpus(wavPath, clipPath)
      // A broken clip is generated again
      if ((await exists(clipPath)) && !(await isIntact(clipPath))) await fs.rm(clipPath)
      const cached = await exists(clipPath)

      if (!cached) {
        if (!health) return null
        await fs.writeFile(`${wavPath}.tmp`, await synthesize(text, lang))
        await toOpus(`${wavPath}.tmp`, clipPath)
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
