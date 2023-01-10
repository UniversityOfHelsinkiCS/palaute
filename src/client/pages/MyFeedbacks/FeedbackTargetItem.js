import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { lightFormat, parseISO } from 'date-fns'

import { Box, Button, ListItemText, Chip, Dialog, DialogTitle, ListItem } from '@mui/material'
import { useSnackbar } from 'notistack'

import FeedbackGivenIcon from '@mui/icons-material/Check'
import NoFeedbackIcon from '@mui/icons-material/Edit'
import FeedbackClosedIcon from '@mui/icons-material/Lock'

import { useQueryClient } from 'react-query'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import apiClient from '../../util/apiClient'
import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'
import styles from '../../util/chipStyles'

const NoFeedbackActions = ({ editPath }) => {
  const { t } = useTranslation()

  return (
    <Button variant="contained" color="primary" to={editPath} component={Link} data-cy="giveCourseFeedback">
      {t('userFeedbacks:giveFeedbackButton')}
    </Button>
  )
}

const FeedbackGivenActions = ({ editPath, onDelete, viewPath }) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  const handleOpen = () => {
    setOpen(true)
  }

  const handleSubmit = async () => {
    onDelete()
    handleClose()
  }

  return (
    <Box>
      <Button variant="outlined" color="primary" component={Link} to={editPath} sx={{ mr: '1rem' }}>
        {t('userFeedbacks:modifyFeedbackButton')}
      </Button>

      <Button variant="outlined" color="primary" component={Link} to={viewPath} sx={{ mr: '1rem' }}>
        {t('userFeedbacks:viewFeedbackSummary')}
      </Button>
      <Button color="error" onClick={handleOpen}>
        {t('userFeedbacks:clearFeedbackButton')}
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{t('userFeedbacks:clearConfirmationQuestion')}</DialogTitle>
        <Button onClick={handleClose} color="primary">
          {t('userFeedbacks:no')}
        </Button>
        <Button onClick={handleSubmit} color="primary" autoFocus>
          {t('userFeedbacks:yes')}
        </Button>
      </Dialog>
    </Box>
  )
}

const FeedbackEndedActions = ({ viewPath }) => {
  const { t } = useTranslation()

  return (
    <Button color="primary" variant="outlined" component={Link} to={viewPath}>
      {t('userFeedbacks:viewFeedbackSummary')}
    </Button>
  )
}

const ContinuousFeedbackActions = ({ viewPath }) => {
  const { t } = useTranslation()

  return (
    <Button color="primary" variant="contained" component={Link} to={viewPath} data-cy="giveContinuousFeedback">
      {t('userFeedbacks:giveContinuousFeedback')}
    </Button>
  )
}

const FeedbackGivenChip = () => {
  const { t } = useTranslation()

  return (
    <Chip
      variant="outlined"
      icon={<FeedbackGivenIcon />}
      label={t('userFeedbacks:feedbackGivenChip')}
      color="primary"
      sx={styles.success}
    />
  )
}

const NoFeedbackChip = () => {
  const { t } = useTranslation()

  return (
    <Chip
      variant="outlined"
      icon={<NoFeedbackIcon />}
      label={t('userFeedbacks:waitingForFeedbackChip')}
      sx={styles.shimmering}
    />
  )
}

const FeedbackEndedChip = () => {
  const { t } = useTranslation()

  return <Chip variant="outlined" icon={<FeedbackClosedIcon />} label={t('userFeedbacks:feedbackEndedChip')} />
}

const FeedbackNotStartedChip = () => {
  const { t } = useTranslation()

  return <Chip variant="outlined" icon={<FeedbackClosedIcon />} label={t('userFeedbacks:feedbackNotStartedChip')} />
}

const ContinuousFeedbackChip = () => {
  const { t } = useTranslation()

  return (
    <Chip
      variant="outlined"
      icon={<NoFeedbackIcon />}
      label={t('userFeedbacks:continuousFeedbackChip')}
      sx={styles.shimmeringSecondary}
    />
  )
}

const formatDate = date => lightFormat(date, 'd.M.yyyy')

const FeedbackTargetItem = ({ feedbackTarget, divider }) => {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const queryClient = useQueryClient()

  const { id, closesAt, opensAt, feedback } = feedbackTarget

  const periodInfo = t('feedbackOpenPeriod', {
    opensAt: formatDate(parseISO(opensAt)),
    closesAt: formatDate(parseISO(closesAt)),
  })

  const feedbackGiven = Boolean(feedback)
  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const notStarted = !isOpen && !isEnded
  const { continuousFeedbackEnabled } = feedbackTarget

  const onDelete = async () => {
    await apiClient.delete(`/feedbacks/${feedback.id}`)
    queryClient.invalidateQueries('feedbackTargetsForStudent')
    enqueueSnackbar(t('userFeedbacks:deleted'), { variant: 'success' })
  }

  const editPath = `/targets/${id}/feedback`
  const viewPath = `/targets/${id}/results`

  return (
    <ListItem sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }} divider={divider} disableGutters>
      <ListItemText primary={periodInfo} />

      <Box mt={1} mb={1}>
        {isEnded && !feedbackGiven && <FeedbackEndedChip />}
        {notStarted && !continuousFeedbackEnabled && <FeedbackNotStartedChip />}
        {notStarted && continuousFeedbackEnabled && <ContinuousFeedbackChip />}
        {feedbackGiven && <FeedbackGivenChip />}
        {isOpen && !feedbackGiven && <NoFeedbackChip />}
      </Box>

      <Box m={-0.5} mt={1}>
        {isEnded && <FeedbackEndedActions viewPath={viewPath} />}
        {notStarted && continuousFeedbackEnabled && <ContinuousFeedbackActions viewPath={editPath} />}
        {isOpen && feedbackGiven && (
          <FeedbackGivenActions editPath={editPath} onDelete={onDelete} viewPath={viewPath} />
        )}
        {isOpen && !feedbackGiven && <NoFeedbackActions editPath={editPath} />}
      </Box>
    </ListItem>
  )
}

export default FeedbackTargetItem
