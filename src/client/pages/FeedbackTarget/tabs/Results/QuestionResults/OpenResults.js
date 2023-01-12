import React from 'react'
import { Box, CircularProgress, IconButton, ListItem, ListItemText, Tooltip } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { grey } from '@mui/material/colors'
import { useTranslation } from 'react-i18next'
import { useInView } from 'react-intersection-observer'

import ResultsContent from './ResultsContent'
import useUpdateOpenFeedbackVisibility from './useUpdateOpenFeedbackVisibility'

const styles = {
  list: theme => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    flexGrow: 100,
    padding: '1rem',
    marginBottom: '1rem',
    maxHeight: '800px',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: 8,
    },
    '&::-webkit-scrollbar-track': {
      background: grey[200],
      borderRadius: 10,
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.primary.light,
      borderRadius: 10,
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: theme.palette.info.main,
    },
    '@media print': {
      overflow: 'visible',
      maxHeight: '100%',
      height: 'auto',
    },
  }),
  listItem: {
    boxShadow: `0 2px 4px 0 rgb(0 0 0 / 7%)`,
    backgroundColor: grey[50],
    borderRadius: '0.8rem',
    marginBottom: '0.5rem',
  },
  hiddenListItem: theme => ({
    color: theme.palette.error.light,
  }),
}

const OpenFeedback = ({ feedback }) => {
  const { t } = useTranslation()
  const { canHide, toggleVisibility } = useUpdateOpenFeedbackVisibility()
  const secondaryText = feedback.hidden ? t('feedbackTargetResults:hiddenInfo') : ''

  return (
    <ListItem
      sx={[styles.listItem, feedback.hidden ? styles.hiddenListItem : {}]}
      secondaryAction={
        canHide && (
          <Box display="flex" alignContent="start">
            <Tooltip
              title={t(feedback.hidden ? 'feedbackTargetResults:setVisible' : 'feedbackTargetResults:setHidden')}
            >
              <IconButton onClick={() => toggleVisibility(feedback)} size="small">
                {feedback.hidden ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
        )
      }
    >
      <ListItemText
        sx={{ py: '0.2rem' }}
        primary={feedback.data}
        primaryTypographyProps={{ fontSize: 18, whiteSpace: 'pre-line', fontWeight: '400' }}
        secondary={secondaryText}
      />
    </ListItem>
  )
}

const OpenResults = ({ question }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1, delay: 1000 })

  const feedbacks = React.useMemo(() => (question.feedbacks ?? []).filter(({ data }) => Boolean(data)), [question])

  const largeList = feedbacks.length > 10

  return (
    <ResultsContent>
      <Box display="flex" justifyContent="center">
        <Box sx={[styles.list, largeList ? { height: '800px' } : {}]} ref={ref}>
          {largeList && !inView && (
            <Box display="flex" alignSelf="stretch" justifyContent="center">
              <CircularProgress />
            </Box>
          )}
          {(!largeList || inView) && feedbacks.map((f, index) => <OpenFeedback feedback={f} key={index} />)}
        </Box>
      </Box>
    </ResultsContent>
  )
}

export default OpenResults
