import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { useQueryClient } from 'react-query'
import { useTranslation } from 'react-i18next'

import { Box, Button, ListItemText, Chip, Dialog, DialogTitle, ListItem, Typography } from '@mui/material'

import FeedbackGivenIcon from '@mui/icons-material/Check'
import NoFeedbackIcon from '@mui/icons-material/Edit'
import FeedbackClosedIcon from '@mui/icons-material/Lock'
import FeedbackNotGivenIcon from '@mui/icons-material/Close'

import { getCourseName } from './utils'
import { getLanguageValue } from '../../util/languageUtils'
import styles from '../../util/chipStyles'
import apiClient from '../../util/apiClient'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import noFeedbackAllowed from '../../util/noFeedbackAllowed'
import { getStartAndEndString } from '../../util/getDateRangeString'
import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'
import feedbackTargetCourseIsOngoing from '../../util/feedbackTargetCourseIsOngoing'
import feedbackTargetNotGivingFeedback from '../../util/feedbackTargetNotGivingFeedback'
import { SHOW_FEEDBACKS_TO_STUDENTS_ONLY_AFTER_ENDING } from '../../util/common'
import { getCourseCode } from '../../util/courseIdentifiers'

const NoFeedbackActions = ({ editPath, noFeedbackAllowed, onNotGivingFeedback }) => {
  const { t } = useTranslation()

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        to={editPath}
        component={Link}
        data-cy="feedback-item-give-feedback"
        sx={{ mr: '1rem' }}
      >
        {t('userFeedbacks:giveFeedbackButton')}
      </Button>

      <NotGivingFeedbackButton noFeedbackAllowed={noFeedbackAllowed} onNotGivingFeedback={onNotGivingFeedback} />
    </div>
  )
}

const NotGivingFeedbackButton = ({ noFeedbackAllowed, onNotGivingFeedback }) => {
  const { t } = useTranslation()

  if (noFeedbackAllowed) {
    return (
      <Button
        variant="contained"
        color="error"
        onClick={onNotGivingFeedback}
        data-cy="feedback-item-not-giving-feedback"
      >
        {t('userFeedbacks:notGivingFeedbackButton')}
      </Button>
    )
  }
  return null
}

const FeedbackGivenActions = ({ editPath, onDelete, viewPath, notGivingFeedback }) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  const handleSubmit = async () => {
    onDelete()
    handleClose()
  }

  return (
    <Box>
      <GiveModifyFeedbackButton notGivingFeedback={notGivingFeedback} editPath={editPath} componentLink={Link} />

      <FeedbackSummaryButtonForOpenGivenTarget viewPath={viewPath} />

      <RemoveFeedbackButton notGivingFeedback={notGivingFeedback} setOpen={setOpen} />

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

const GiveModifyFeedbackButton = ({ notGivingFeedback, editPath, componentLink }) => {
  const { t } = useTranslation()

  if (notGivingFeedback) {
    return (
      <Button
        variant="contained"
        color="primary"
        to={editPath}
        component={componentLink}
        data-cy="feedback-item-give-feedback"
        sx={{ mr: '1rem' }}
      >
        {t('userFeedbacks:giveFeedbackButton')}
      </Button>
    )
  }
  return (
    <Button
      data-cy="feedback-item-modify-feedback"
      variant="outlined"
      color="primary"
      component={componentLink}
      to={editPath}
      sx={{ mr: '1rem' }}
    >
      {t('userFeedbacks:modifyFeedbackButton')}
    </Button>
  )
}

const RemoveFeedbackButton = ({ notGivingFeedback, setOpen }) => {
  const { t } = useTranslation()

  const handleOpen = () => {
    setOpen(true)
  }

  if (notGivingFeedback) {
    return null
  }
  return (
    <Button data-cy="feedback-item-clear-feedback" color="error" onClick={handleOpen}>
      {t('userFeedbacks:clearFeedbackButton')}
    </Button>
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

const NoFeedbackGivenChip = () => {
  const { t } = useTranslation()

  return (
    <Chip
      variant="outlined"
      icon={<FeedbackNotGivenIcon color="chipError" />}
      label={t('userFeedbacks:noFeedbackGivenChip')}
      sx={styles.error}
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

  const { id, closesAt, opensAt, feedback, feedbackResponse, courseUnit } = feedbackTarget

  const [startDate, endDate] = getStartAndEndString(opensAt, closesAt)
  const periodInfo = t('common:feedbackOpenPeriod', {
    opensAt: startDate,
    closesAt: endDate,
  })

  const courseName = getCourseName(feedbackTarget, t)
  const visibleCourseCode = getCourseCode(courseUnit)
  const translatedName = getLanguageValue(courseName, i18n.language)

  const editPath = `/targets/${id}/feedback`
  const viewPath = `/targets/${id}/results`

  const feedbackGiven = Boolean(feedback)
  const feedbackResponseGiven = feedbackResponse?.length > 3
  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const notStarted = feedbackTargetCourseIsOngoing(feedbackTarget) && !isOpen
  const noFeedbackAllowedEnabled = noFeedbackAllowed(feedbackTarget)
  const notGivingFeedback = feedbackTargetNotGivingFeedback(feedbackTarget)
  const { continuousFeedbackEnabled } = feedbackTarget

  const onDelete = async () => {
    await apiClient.delete(`/feedbacks/${feedback.id}`)
    queryClient.invalidateQueries('feedbackTargetsForStudent')
    // Invalidate the waiting feedback count for the student
    queryClient.invalidateQueries('myFeedbacksWaitingFeedbackCount')

    enqueueSnackbar(t('userFeedbacks:deleted'), { variant: 'success' })
  }

  const onNotGivingFeedback = async () => {
    await apiClient.put(`/feedback-targets/${feedbackTarget.id}/not-giving-feedback`)
    queryClient.invalidateQueries('feedbackTargetsForStudent')
    enqueueSnackbar(t('userFeedbacks:noFeedbackGiven'), { variant: 'success' })
  }

  return (
    <ListItem
      data-cy={`feedback-item-${feedbackTarget.id}`}
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}
      divider={divider}
      disableGutters
    >
      <Typography variant="body1" fontWeight={600} component="h2">
        {visibleCourseCode} {translatedName}
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
        {isEnded && !feedbackGiven && !notGivingFeedback && <FeedbackEndedChip />}
        {notStarted && !continuousFeedbackEnabled && <FeedbackNotStartedChip />}
        {notStarted && continuousFeedbackEnabled && <ContinuousFeedbackChip />}
        {feedbackGiven && <FeedbackGivenChip />}
        {isOpen && !feedbackGiven && !notGivingFeedback && <NoFeedbackChip />}
        {feedbackResponseGiven && <FeedbackResponseChip />}
        {noFeedbackAllowedEnabled && notGivingFeedback && <NoFeedbackGivenChip />}
      </Box>

      <Box m={-0.5} mt={1}>
        {isEnded && <FeedbackEndedActions viewPath={viewPath} />}
        {notStarted && continuousFeedbackEnabled && <ContinuousFeedbackActions viewPath={editPath} />}
        {isOpen && (feedbackGiven || notGivingFeedback) && (
          <FeedbackGivenActions
            editPath={editPath}
            onDelete={onDelete}
            viewPath={viewPath}
            notGivingFeedback={notGivingFeedback}
          />
        )}
        {isOpen && !feedbackGiven && !notGivingFeedback && (
          <NoFeedbackActions
            editPath={editPath}
            noFeedbackAllowed={noFeedbackAllowedEnabled}
            onNotGivingFeedback={onNotGivingFeedback}
          />
        )}
      </Box>
    </ListItem>
  )
}

export default FeedbackTargetItem
