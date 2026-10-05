import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export type Cue = { startMs: number; text: string }
export type PlacedClip = { path: string; offsetMs: number }

const timestamp = (ms: number) => new Date(ms).toISOString().slice(11, 23)

export const writeVtt = async (path: string, cues: Cue[], endMs: number) => {
  // An empty cue only ends the one before it
  const blocks = cues
    .map((cue, i) => ({ ...cue, endMs: cues[i + 1]?.startMs ?? endMs }))
    .filter(cue => cue.text)
    .map((cue, i) => `${i + 1}\n${timestamp(cue.startMs)} --> ${timestamp(cue.endMs)}\n${cue.text}`)
  await fs.writeFile(path, `WEBVTT\n\n${blocks.join('\n\n')}\n`)
}

const narrationArgs = (clips: PlacedClip[]) => {
  if (clips.length === 0) return ['-map', '0:v']
  const delayed = clips.map((clip, i) => `[${i + 1}:a]adelay=${clip.offsetMs}:all=1[a${i}]`)
  const mixInputs = clips.map((_, i) => `[a${i}]`).join('')
  const filter = `${delayed.join(';')};${mixInputs}amix=inputs=${clips.length}:duration=longest:normalize=0,apad[narration]`
  return [
    ...clips.flatMap(clip => ['-i', clip.path]),
    '-filter_complex',
    filter,
    '-map',
    '0:v',
    '-map',
    '[narration]',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-shortest',
  ]
}

// Playwright only records .webm, keep it if ffmpeg is unavailable
export const encodeVideo = async (webmPath: string, clips: PlacedClip[], trimMs = 0) => {
  const mp4Path = webmPath.replace(/\.webm$/, '.mp4')
  try {
    await execFileAsync('ffmpeg', [
      '-y',
      '-ss',
      (trimMs / 1000).toFixed(3),
      '-i',
      webmPath,
      ...narrationArgs(clips),
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      mp4Path,
    ])
    await fs.rm(webmPath)
    return mp4Path
  } catch (error) {
    console.warn(`Could not encode mp4, keeping ${webmPath}:`, (error as Error).message)
    return webmPath
  }
}
