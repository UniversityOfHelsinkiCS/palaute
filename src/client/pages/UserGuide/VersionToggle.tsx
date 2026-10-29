import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material'

import type { GuideVersion } from './content'

import { GUIDE_VERSIONS } from './content'
import { PAGE_TOP_GAP } from './useHeaderHeight'

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
        <ToggleButton key={option} value={option} sx={{ px: 2, py: 0.25 }}>
          {option}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  </Box>
)

export default VersionToggle
