import { Visibility, VisibilityOff } from '@mui/icons-material'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'
import { grey } from '@mui/material/colors'
import React from 'react'
import { useTranslation } from 'react-i18next'

const styles = {
  listItem: {
    display: 'flex',
    boxShadow: `0 1px 5px 0px rgb(0 0 50 / 13%)`,
    backgroundColor: grey[50],
    borderRadius: '0.8rem',
    marginBottom: '0.6rem',
    p: '0.9rem',
    width: '100%',
    alignItems: 'start',
  },
  hiddenListItem: theme => ({
    color: theme.palette.error.light,
  }),
  noPrint: {
    '@media print': { display: 'none' },
  },
}

export const OpenFeedbackContainer = ({ children, sx = {} }) => <Box sx={[styles.listItem, sx]}>{children}</Box>

export const OpenFeedbackText = ({ content }) => (
  <Typography whiteSpace="pre-line" fontSize={18} fontWeight={400}>
    {content}
  </Typography>
)

export const OpenFeedback = ({ content, hidden, toggleVisibility, canHide }) => {
  const { t } = useTranslation()
  const secondaryText = hidden ? t('feedbackTargetResults:hiddenInfo') : ''

  return (
    <OpenFeedbackContainer sx={hidden ? styles.hiddenListItem : {}}>
      <Box display="flex" flexDirection="column" mr="auto">
        {content}
        <Typography variant="caption" color="textSecondary">
          {secondaryText}
        </Typography>
      </Box>
      {canHide && (
        <Box display="flex" alignContent="start" sx={styles.noPrint}>
          <Tooltip title={t(hidden ? 'feedbackTargetResults:setVisible' : 'feedbackTargetResults:setHidden')}>
            <IconButton onClick={() => toggleVisibility()} size="small">
              {hidden ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </OpenFeedbackContainer>
  )
}
