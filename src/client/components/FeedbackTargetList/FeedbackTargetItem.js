import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'

import {
  ListItemText,
  ListItem,
  Box,
  Button,
  Menu,
  MenuItem,
} from '@mui/material'

import MoreHoriz from '@mui/icons-material/MoreHoriz'

import { formatDate } from './utils'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'

const styles = {
  listItem: {},
  action: {
    '&:not(:last-child)': {
      marginRight: (theme) => theme.spacing(1),
    },
  },
}

const ActionsButton = ({ feedbackTarget }) => {
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
      <Button
        color="primary"
        startIcon={<MoreHoriz />}
        onClick={handleOpen}
        ref={buttonRef}
      >
        {t('actions')}
      </Button>
      <Menu
        anchorEl={buttonRef.current}
        keepMounted
        open={open}
        onClose={handleClose}
      >
        {!isOpen && !isEnded && (
          <MenuItem component={Link} to={`/targets/${id}/edit`}>
            {t('feedbackTargetList:editSurvey')}
          </MenuItem>
        )}
        <MenuItem component={Link} to={`/targets/${id}/feedback`}>
          {t('feedbackTargetList:showSurvey')}
        </MenuItem>
        {isStarted && (
          <MenuItem component={Link} to={`/targets/${id}/results`}>
            {t('feedbackTargetList:showFeedbacks')}
          </MenuItem>
        )}
        {isEnded && studentListVisible && (
          <MenuItem
            component={Link}
            to={`/targets/${id}/students-with-feedback`}
          >
            {t('feedbackTargetList:showStudentsWithFeedback')}
          </MenuItem>
        )}
        {isStarted && isEnded && (
          <MenuItem component={Link} to={`/targets/${id}/feedback-response`}>
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

const FeedbackTargetItem = ({ feedbackTarget, divider }) => {
  const { t } = useTranslation()

  const { closesAt, opensAt, feedbackCount, enrolledCount } = feedbackTarget

  const periodInfo = t('feedbackOpenPeriod', {
    opensAt: formatDate(opensAt),
    closesAt: formatDate(closesAt),
  })

  return (
    <ListItem sx={styles.listItem} divider={divider} disableGutters>
      <ListItemText primary={periodInfo} />
      <ListItemText
        primary={t('feedbackTargetList:studentFeedbacks', {
          count: feedbackCount,
          totalCount: enrolledCount,
        })}
      />
      <Box ml={2} display="flex">
        <ActionsButton feedbackTarget={feedbackTarget} />
      </Box>
    </ListItem>
  )
}

export default FeedbackTargetItem
