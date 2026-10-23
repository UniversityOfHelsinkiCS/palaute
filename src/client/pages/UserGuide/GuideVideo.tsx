import { Box } from '@mui/material'
import { useQuery } from '@tanstack/react-query'

import { basePath } from '../../util/common'

// Written by e2e/manual when the videos are recorded
type VideoInfo = {
  slug: string
  title: string
  url: string
}

const useVideos = (language: string) =>
  useQuery({
    queryKey: ['userGuideVideos', language],
    queryFn: async (): Promise<VideoInfo[]> => {
      const response = await fetch(`${basePath}/manual/${language}/index.json`)
      // No videos where they haven't been recorded, e.g. in development
      return response.ok ? response.json() : []
    },
    staleTime: Infinity,
  })

const GuideVideo = ({ slug, language }: { slug: string; language: string }) => {
  const { data: videos } = useVideos(language)
  const video = videos?.find(other => other.slug === slug)
  if (!video) return null

  return (
    <Box component="figure" sx={{ mx: 0, my: 2 }}>
      {/* The narration is also shown as captions in the video */}
      {/* oxlint-disable-next-line jsx-a11y/media-has-caption */}
      <Box
        component="video"
        src={`${basePath}${video.url}`}
        aria-label={video.title}
        controls
        preload="metadata"
        sx={{ display: 'block', width: '100%', borderRadius: 1, bgcolor: 'grey.900' }}
      />
    </Box>
  )
}

export default GuideVideo
