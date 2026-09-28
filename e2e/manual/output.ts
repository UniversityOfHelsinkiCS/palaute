import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export type Cue = { startMs: number; text: string }

const timestamp = (ms: number) => new Date(ms).toISOString().slice(11, 23)

export const writeVtt = async (path: string, cues: Cue[], endMs: number) => {
  const blocks = cues.map((cue, i) => {
    const cueEnd = cues[i + 1]?.startMs ?? endMs
    return `${i + 1}\n${timestamp(cue.startMs)} --> ${timestamp(cueEnd)}\n${cue.text}`
  })
  await fs.writeFile(path, `WEBVTT\n\n${blocks.join('\n\n')}\n`)
}

// Playwright only records .webm, keep it if ffmpeg is unavailable
export const convertToMp4 = async (webmPath: string) => {
  const mp4Path = webmPath.replace(/\.webm$/, '.mp4')
  try {
    await execFileAsync('ffmpeg', [
      '-y',
      '-i',
      webmPath,
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
    console.warn(`Could not convert to mp4, keeping ${webmPath}:`, (error as Error).message)
    return webmPath
  }
}
