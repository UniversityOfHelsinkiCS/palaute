import { Box, LinearProgress, Typography, useMediaQuery } from '@mui/material'
import { useTranslation } from 'react-i18next'

type AccessibleLoadingBarProps = {
  label?: string
}

/**
 * Adds a visible and accessible label to LinearProgress.
 * The label is announced politely as it appears.
 * Respects prefers-reduced-emotion.
 */
export const AccessibleLoadingBar = ({ label }: AccessibleLoadingBarProps) => {
  const { t } = useTranslation()
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const loadingLabel = label ?? t('courseSummary:loading')
  const labelId = 'accessible-loading-bar-label'

  return (
    <Box role="status" aria-live="polite">
      <Typography id={labelId} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        {loadingLabel}
      </Typography>
      {prefersReducedMotion ? (
        <LinearProgress aria-labelledby={labelId} variant="determinate" value={60} />
      ) : (
        <LinearProgress aria-labelledby={labelId} />
      )}
    </Box>
  )
}
