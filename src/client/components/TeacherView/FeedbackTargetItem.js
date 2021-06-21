import React, { useRef, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'
import { parseISO } from 'date-fns'

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
  Tooltip,
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

    enqueueSnackbar(t('teacherView:copied'), { variant: 'info' })
    handleClose()
  }

  return (
    <>
      <IconButton
        id={`settings-icon-${id}`}
        onClick={handleOpen}
        ref={buttonRef}
      >
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
            {t('teacherView:editSurvey')}
          </MenuItem>
        )}
        {isStarted && (
          <MenuItem component={RouterLink} to={`/targets/${id}/results`}>
            {t('teacherView:showFeedbacks')}
          </MenuItem>
        )}
        {isEnded && studentListVisible && (
          <MenuItem
            component={RouterLink}
            to={`/targets/${id}/students-with-feedback`}
          >
            {t('teacherView:showStudentsWithFeedback')}
          </MenuItem>
        )}
        {isStarted && isEnded && (
          <MenuItem
            component={RouterLink}
            to={`/targets/${id}/feedback-response`}
          >
            {feedbackTarget.feedbackResponse
              ? t('teacherView:editFeedbackResponse')
              : t('teacherView:giveFeedbackResponse')}
          </MenuItem>
        )}
        {!isEnded && (
          <MenuItem color="primary" onClick={() => handleCopy('feedback')}>
            {t('teacherView:copyLink')}
          </MenuItem>
        )}
        {isEnded && (
          <MenuItem color="primary" onClick={() => handleCopy('results')}>
            {t('teacherView:copyResponseLink')}
          </MenuItem>
        )}
      </Menu>
    </>
  )
}

const getChip = (feedbackTarget, t) => {
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
    return (
      <Chip
        label={t('teacherView:feedbackOpen')}
        variant="outlined"
        size="small"
      />
    )
  }

  return null
}

const FeedbackTargetItem = ({ feedbackTarget, divider = true }) => {
  const { t } = useTranslation()

  const {
    id,
    feedbackCount,
    enrolledCount,
    courseRealisation,
    opensAt,
    closesAt,
  } = feedbackTarget

  const { startDate, endDate } = courseRealisation

  const periodInfo = (
    <Tooltip
      title={t('teacherView:surveyOpen', {
        closesAt: formatDate(closesAt),
        opensAt: formatDate(opensAt),
      })}
    >
      <Link component={RouterLink} to={`/targets/${id}/feedback`}>
        {formatDate(startDate)} - {formatDate(endDate)}
      </Link>
    </Tooltip>
  )

  const chip = getChip(feedbackTarget, t)

  return (
    <ListItem divider={divider}>
      <ListItemIcon>
        <SettingsButton feedbackTarget={feedbackTarget} />
      </ListItemIcon>
      <ListItemText
        disableTypography
        primary={<Typography>{periodInfo}</Typography>}
        secondary={
          <>
            <Typography variant="body2" color="textSecondary" component="span">
              {parseISO(feedbackTarget.opensAt) < new Date()
                ? t('teacherView:feedbackCount', {
                    count: feedbackCount,
                    totalCount: enrolledCount,
                  })
                : t('teacherView:feedbackNotStarted')}
            </Typography>{' '}
            {chip}
          </>
        }
      />
    </ListItem>
  )
}

export default FeedbackTargetItem
