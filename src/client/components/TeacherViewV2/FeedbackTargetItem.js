import React, { useRef, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'

import {
  ListItemText,
  ListItem,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  IconButton,
  Link,
  Chip,
} from '@material-ui/core'

import SettingsIcon from '@material-ui/icons/Settings'

import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'
import { formatDate } from './utils'
import FeedbackResponseChip from './FeedbackResponseChip'

const SettingsButton = ({ feedbackTarget }) => {
  const buttonRef = useRef()
  const [open, setOpen] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()

  const { id, opensAt, studentListVisible } = feedbackTarget
  const now = new Date()
  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const isStarted = now >= new Date(opensAt)

  const handleClose = () => {
    setOpen(false)
  }

  const handleOpen = () => {
    setOpen(true)
  }

  const handleCopy = (target) => {
    navigator.clipboard.writeText(
      `${window.location.protocol}//${window.location.host}/palaute/targets/${id}/${target}`,
    )

    enqueueSnackbar(t('feedbackTargetList:copied'), { variant: 'info' })
    handleClose()
  }

  return (
    <>
      <IconButton onClick={handleOpen} ref={buttonRef}>
        <SettingsIcon />
      </IconButton>

      <Menu
        anchorEl={buttonRef.current}
        keepMounted
        open={open}
        onClose={handleClose}
      >
        {!isOpen && !isEnded && (
          <MenuItem component={RouterLink} to={`/targets/${id}/edit`}>
            {t('feedbackTargetList:editSurvey')}
          </MenuItem>
        )}
        {isStarted && (
          <MenuItem component={RouterLink} to={`/targets/${id}/results`}>
            {t('feedbackTargetList:showFeedbacks')}
          </MenuItem>
        )}
        {isEnded && studentListVisible && (
          <MenuItem
            component={RouterLink}
            to={`/targets/${id}/students-with-feedback`}
          >
            {t('feedbackTargetList:showStudentsWithFeedback')}
          </MenuItem>
        )}
        {isStarted && isEnded && (
          <MenuItem
            component={RouterLink}
            to={`/targets/${id}/feedback-response`}
          >
            {feedbackTarget.feedbackResponse
              ? t('feedbackTargetList:editFeedbackResponse')
              : t('feedbackTargetList:giveFeedbackResponse')}
          </MenuItem>
        )}
        {!isEnded && (
          <MenuItem color="primary" onClick={() => handleCopy('feedback')}>
            {t('feedbackTargetList:copyLink')}
          </MenuItem>
        )}
        {isEnded && (
          <MenuItem color="primary" onClick={() => handleCopy('results')}>
            {t('feedbackTargetList:copyResponseLink')}
          </MenuItem>
        )}
      </Menu>
    </>
  )
}

const getChip = (feedbackTarget) => {
  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const { feedbackResponse } = feedbackTarget
  const feedbackResponseGiven = Boolean(feedbackResponse)

  if (isEnded) {
    return (
      <FeedbackResponseChip feedbackResponseGiven={feedbackResponseGiven} />
    )
  }

  if (isOpen) {
    return <Chip label="Palaute käynnissä" variant="outlined" size="small" />
  }

  return null
}

const FeedbackTargetItem = ({ feedbackTarget }) => {
  const { t } = useTranslation()

  const { id, feedbackCount, enrolledCount, courseRealisation } = feedbackTarget

  const { startDate, endDate } = courseRealisation

  const periodInfo = (
    <Link component={RouterLink} to={`/targets/${id}/feedback`}>
      {formatDate(startDate)} - {formatDate(endDate)}
    </Link>
  )

  const chip = getChip(feedbackTarget)

  return (
    <ListItem divider>
      <ListItemIcon>
        <SettingsButton feedbackTarget={feedbackTarget} />
      </ListItemIcon>
      <ListItemText
        primary={periodInfo}
        secondary={
          <>
            <Typography variant="body2" color="textSecondary" component="span">
              {t('feedbackTargetList:studentFeedbacks', {
                count: feedbackCount,
                totalCount: enrolledCount,
              })}
            </Typography>{' '}
            {chip}
          </>
        }
      />
    </ListItem>
  )
}

export default FeedbackTargetItem
