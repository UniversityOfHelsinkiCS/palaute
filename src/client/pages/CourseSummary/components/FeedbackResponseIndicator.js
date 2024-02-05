import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import DoneIcon from '@mui/icons-material/Done'
import ClearIcon from '@mui/icons-material/Clear'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { Box, Tooltip } from '@mui/material'

const styles = {
  resultCell: {
    whiteSpace: 'nowrap',
    textAlign: 'center',
    minWidth: '3.5rem',
  },
  countCell: {
    padding: '0rem 1rem 0rem 1rem',
    whiteSpace: 'nowrap',
    textAlign: 'center',
    minWidth: '100px',
  },
  percentCell: {
    whiteSpace: 'nowrap',
    textAlign: 'right',
    minWidth: '60px',
  },
  labelCell: theme => ({
    [theme.breakpoints.down('md')]: {
      width: '100px',
      height: '74px', // Sets a good height for the entire row
    },
    [theme.breakpoints.up('md')]: {
      width: '450px',
    },
    [theme.breakpoints.up('lg')]: {
      width: '500px',
    },
    paddingRight: '1rem',
  }),
  innerLabelCell: {
    paddingLeft: '1.3rem',
  },
  accordionButton: {
    width: '100%',
    height: '100%',
    minHeight: '48px',
    maxHeight: '74px',
    paddingLeft: '0.5rem',
    paddingRight: '2.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    borderRadius: '10px',
    textAlign: 'left',
    textTransform: 'none',
    '&:hover': {
      background: theme => theme.palette.action.hover,
    },
  },
  link: {
    color: theme => theme.palette.primary.main,
  },
  arrowContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingRight: '0.7rem',
    '&:hover': {
      color: theme => theme.palette.text.primary,
    },
    color: theme => theme.palette.info.main,
  },
  arrow: {
    transition: 'transform 0.2s ease-out',
  },
  arrowOpen: {
    transform: 'rotate(90deg)',
  },
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
