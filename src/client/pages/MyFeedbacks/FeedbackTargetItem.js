import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { useQueryClient } from 'react-query'
import { useTranslation } from 'react-i18next'

import { Box, Button, ListItemText, Chip, Dialog, DialogTitle, ListItem, Typography } from '@mui/material'

import FeedbackGivenIcon from '@mui/icons-material/Check'
import NoFeedbackIcon from '@mui/icons-material/Edit'
import FeedbackClosedIcon from '@mui/icons-material/Lock'

import { getCourseName } from './utils'
import { getLanguageValue } from '../../util/languageUtils'
import styles from '../../util/chipStyles'
import apiClient from '../../util/apiClient'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import { getStartAndEndString } from '../../util/getDateRangeString'
import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'
import feedbackTargetCourseIsOngoing from '../../util/feedbackTargetCourseIsOngoing'
import { SHOW_FEEDBACKS_TO_STUDENTS_ONLY_AFTER_ENDING } from '../../util/common'

const NoFeedbackActions = ({ editPath }) => {
  const { t } = useTranslation()

  return (
    <Button variant="contained" color="primary" to={editPath} component={Link} data-cy="feedback-item-give-feedback">
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
      <Button
        data-cy="feedback-item-modify-feedback"
        variant="outlined"
        color="primary"
        component={Link}
        to={editPath}
        sx={{ mr: '1rem' }}
      >
        {t('userFeedbacks:modifyFeedbackButton')}
      </Button>

      <FeedbackSummaryButtonForOpenGivenTarget viewPath={viewPath} />

      <Button data-cy="feedback-item-clear-feedback" color="error" onClick={handleOpen}>
        {t('userFeedbacks:clearFeedbackButton')}
      </Button>

      <Dialog data-cy="feedback-item-clear-feedback-dialog" open={open} onClose={handleClose}>
        <DialogTitle>{t('userFeedbacks:clearConfirmationQuestion')}</DialogTitle>
        <Button data-cy="feedback-item-view-feedback-cancel" onClick={handleClose} color="primary">
          {t('userFeedbacks:no')}
        </Button>
        <Button data-cy="feedback-item-view-feedback-confirm" onClick={handleSubmit} color="primary" autoFocus>
          {t('userFeedbacks:yes')}
        </Button>
      </Dialog>
    </Box>
  )
}

const FeedbackSummaryButtonForOpenGivenTarget = ({ viewPath }) => {
  const { t } = useTranslation()

  if (!SHOW_FEEDBACKS_TO_STUDENTS_ONLY_AFTER_ENDING) {
    return (
      <Button
        data-cy="feedback-item-view-feedback"
        variant="outlined"
        color="primary"
        component={Link}
        to={viewPath}
        sx={{ mr: '1rem' }}
      >
        {t('userFeedbacks:viewFeedbackSummary')}
      </Button>
    )
  }
  return null
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

const FeedbackResponseChip = () => {
  const { t } = useTranslation()

  return (
    <Chip
      variant="outlined"
      icon={<FeedbackGivenIcon />}
      label={t('userFeedbacks:feedbackResponseGiven')}
      sx={styles.success}
    />
  )
}

const PeriodInfoAddition = ({ isEnded }) => {
  const { t } = useTranslation()

  if (!isEnded && SHOW_FEEDBACKS_TO_STUDENTS_ONLY_AFTER_ENDING) {
    return <ListItemText primary={t('userFeedbacks:summaryAvailableWhenEnded')} />
  }

  return null
}

const FeedbackTargetItem = ({ feedbackTarget, divider }) => {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  const { id, closesAt, opensAt, feedback, feedbackResponse } = feedbackTarget

  const [startDate, endDate] = getStartAndEndString(opensAt, closesAt)
  const periodInfo = t('common:feedbackOpenPeriod', {
    opensAt: startDate,
    closesAt: endDate,
  })

  const courseName = getCourseName(feedbackTarget, t)
  const translatedName = getLanguageValue(courseName, i18n.language)

  const editPath = `/targets/${id}/feedback`
  const viewPath = `/targets/${id}/results`

  const feedbackGiven = Boolean(feedback)
  const feedbackResponseGiven = feedbackResponse?.length > 3
  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const notStarted = feedbackTargetCourseIsOngoing(feedbackTarget) && !isOpen
  const { continuousFeedbackEnabled } = feedbackTarget

  const onDelete = async () => {
    await apiClient.delete(`/feedbacks/${feedback.id}`)
    queryClient.invalidateQueries('feedbackTargetsForStudent')
    enqueueSnackbar(t('userFeedbacks:deleted'), { variant: 'success' })
  }

  return (
    <ListItem
      data-cy={`feedback-item-${feedbackTarget.id}`}
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}
      divider={divider}
      disableGutters
    >
      <Typography variant="body1" fontWeight={600} component="h2">
        {translatedName}
      </Typography>
      <ListItemText primary={periodInfo} />
      <PeriodInfoAddition isEnded={isEnded} />
      {notStarted && continuousFeedbackEnabled && <ListItemText primary={t('userFeedbacks:continousFeedbackActive')} />}

      <Box
        mt={1}
        mb={1}
        display="flex"
        rowGap="0.4rem"
        columnGap="1rem"
        sx={theme => ({ [theme.breakpoints.down('sm')]: { flexDirection: 'column', alignItems: 'start' } })}
      >
        {isEnded && !feedbackGiven && <FeedbackEndedChip />}
        {notStarted && !continuousFeedbackEnabled && <FeedbackNotStartedChip />}
        {notStarted && continuousFeedbackEnabled && <ContinuousFeedbackChip />}
        {feedbackGiven && <FeedbackGivenChip />}
        {isOpen && !feedbackGiven && <NoFeedbackChip />}
        {feedbackResponseGiven && <FeedbackResponseChip />}
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
