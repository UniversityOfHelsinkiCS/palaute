import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export type PlacedClip = { path: string; offsetMs: number }

export type VideoInfo = {
  slug: string
  title: string
  url: string
  durationMs: number
  captions: string[]
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

// One index per language lists the videos with their captions
export const updateIndex = async (dir: string, video: VideoInfo) => {
  const indexPath = path.join(dir, 'index.json')
  let index: VideoInfo[] = []
  try {
    index = JSON.parse(await fs.readFile(indexPath, 'utf8'))
  } catch {
    // The first video of the language
  }
  const videos = [...index.filter(other => other.slug !== video.slug), video]
  videos.sort((a, b) => a.slug.localeCompare(b.slug))
  await fs.writeFile(indexPath, `${JSON.stringify(videos, null, 2)}\n`)
}
