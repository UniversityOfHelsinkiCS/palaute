import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import DoneIcon from '@mui/icons-material/Done'
import ClearIcon from '@mui/icons-material/Clear'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { Box, Tooltip } from '@mui/material'

const styles = {
  given: {
    color: theme => theme.palette.success.main,
    '&:hover': {
      color: theme => theme.palette.success.light,
    },
  },
  notGiven: {
    color: theme => theme.palette.error.main,
    '&:hover': {
      color: theme => theme.palette.error.light,
    },
  },
  feedbackOpen: {
    color: theme => theme.palette.primary.main,
    '&:hover': {
      color: theme => theme.palette.primary.light,
    },
  },
}

const ResponseGivenIcon = ({ link, t }) => (
  <Tooltip
    title={`${t('courseSummary:feedbackResponseGiven')}.\n${t('courseSummary:clickForDetails')}`}
    placement="right"
  >
    <Link to={link}>
      <DoneIcon sx={styles.given} />
    </Link>
  </Tooltip>
)

const ResponseNotGivenIcon = ({ link, t }) => (
  <Tooltip
    title={`${t('courseSummary:feedbackResponseNotGiven')}.\n${t('courseSummary:clickForDetails')}`}
    placement="right"
  >
    <Link to={link}>
      <ClearIcon sx={styles.notGiven} />
    </Link>
  </Tooltip>
)

const FeedbackOpenIcon = ({ link, t }) => (
  <Tooltip title={`${t('courseSummary:feedbackStillOpen')}.\n${t('courseSummary:clickForDetails')}`} placement="right">
    <Link to={link}>
      <AccessTimeIcon sx={styles.feedbackOpen} />
    </Link>
  </Tooltip>
)

const FeedbackResponseIndicator = ({ status, currentFeedbackTargetId }) => {
  const { t } = useTranslation()
  const link = `/targets/${currentFeedbackTargetId}/results`
  return (
    <Box display="flex" justifyContent="center">
      {status === 'GIVEN' && <ResponseGivenIcon link={link} t={t} />}
      {status === 'NONE' && <ResponseNotGivenIcon link={link} t={t} />}
      {status === 'OPEN' && <FeedbackOpenIcon link={link} t={t} />}
    </Box>
  )
}

export default FeedbackResponseIndicator
