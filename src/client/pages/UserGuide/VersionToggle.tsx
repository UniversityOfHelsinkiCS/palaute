import { Box, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material'

import type { GuideVersion } from './content'

import { GUIDE_VERSIONS } from './content'
import { PAGE_TOP_GAP } from './useHeaderHeight'

// For the admins comparing the versions, so only in Finnish
const DESCRIPTIONS: Record<GuideVersion, { title: string; paragraphs?: string[] }> = {
  v1: { title: 'Torstain palaverin jälkeinen rakenne' },
  v2: {
    title: 'Aiheittain',
    paragraphs: [
      'Pyysin Claudea miettimään rakenteen uudelleen uuden jaon pohjalta. Teksti on ennallaan.',
      'Claude päätyi kuitenkin toisenlaiseen jakoon: sivut on ryhmitelty lukijan sijaan aiheen mukaan.',
    ],
  },
  v3: {
    title: 'Lukijoittain, teksti uusittu',
    paragraphs: [
      'Pyysin Claudea palaamaan PO:n suosimaan jakoon ja annoin sen järjestellä ja kirjoittaa tekstiä uudelleen jaon tueksi. Ohjeiden sisältö pysyi samana.',
      'Kukin osa puhuttelee lukijaansa: esimerkiksi Vastuuopettajalle-osio on kirjoitettu suoraan vastuuopettajalle.',
    ],
  },
}

const Description = ({ version }: { version: GuideVersion }) => {
  const { title, paragraphs = [] } = DESCRIPTIONS[version]

  return (
    <>
      <Typography sx={{ fontWeight: 700, fontSize: 'inherit' }}>{title}</Typography>
      {paragraphs.map(paragraph => (
        <Typography key={paragraph} sx={{ fontSize: 'inherit', lineHeight: 'inherit', mt: 0.75 }}>
          {paragraph}
        </Typography>
      ))}
    </>
  )
}

// Admins compare the guide's structures until one is chosen. On wide screens it sits in the menu's space at the top,
// out of the flow, so the menu is laid out as it will be without it.
const VersionToggle = ({ version, onChange }: { version: GuideVersion; onChange: (version: GuideVersion) => void }) => (
  <Box
    sx={{
      position: { md: 'absolute' },
      top: { md: 0 },
      height: { md: PAGE_TOP_GAP },
      display: 'flex',
      alignItems: 'center',
      mb: { xs: 2, md: 0 },
    }}
  >
    <ToggleButtonGroup
      exclusive
      size="small"
      value={version}
      onChange={(_, next: GuideVersion | null) => next && onChange(next)}
      aria-label="Guide structure"
    >
      {GUIDE_VERSIONS.map(option => (
        <Tooltip
          key={option}
          title={<Description version={option} />}
          placement="bottom-start"
          arrow
          enterDelay={150}
          slotProps={{
            tooltip: {
              sx: {
                bgcolor: 'grey.900',
                fontSize: '0.875rem',
                fontWeight: 400,
                lineHeight: 1.5,
                maxWidth: 300,
                p: 1.5,
              },
            },
            arrow: { sx: { color: 'grey.900' } },
          }}
        >
          <ToggleButton value={option} sx={{ px: 2, py: 0.25 }}>
            {option}
          </ToggleButton>
        </Tooltip>
      ))}
    </ToggleButtonGroup>
  </Box>
)

export default VersionToggle
