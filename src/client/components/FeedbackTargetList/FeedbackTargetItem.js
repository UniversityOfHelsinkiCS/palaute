import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'

import {
  ListItemText,
  ListItem,
  Box,
  makeStyles,
  Button,
  Menu,
  MenuItem,
} from '@material-ui/core'

import MoreHoriz from '@material-ui/icons/MoreHoriz'

import { formatDate } from './utils'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'

const useStyles = makeStyles((theme) => ({
  listItem: {},
  action: {
    '&:not(last-child)': {
      marginRight: theme.spacing(1),
    },
  },
}))

const ActionsButton = ({ feedbackTarget }) => {
  const buttonRef = useRef()
  const [open, setOpen] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()

  const { id, opensAt } = feedbackTarget
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

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${window.location.protocol}//${window.location.host}/palaute/targets/${id}/feedback`,
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
        {!isOpen && (
          <MenuItem component={Link} to={`/targets/${id}/edit`}>
            {t('feedbackTargetList:editSurvey')}
          </MenuItem>
        )}
        <MenuItem component={Link} to={`/targets/${id}/feedback`}>
          {t('feedbackTargetList:showSurvey')}
        </MenuItem>
        {isEnded && (
          <MenuItem component={Link} to={`/targets/${id}/results`}>
            {t('feedbackTargetList:showFeedbacks')}
          </MenuItem>
        )}
        {isStarted && (
          <MenuItem
            component={Link}
            to={`/targets/${id}/students-with-feedback`}
          >
            {t('feedbackTargetList:showStudentsWithFeedback')}
          </MenuItem>
        )}
        <MenuItem color="primary" onClick={handleCopy}>
          {t('feedbackTargetList:copyLink')}
        </MenuItem>
      </Menu>
    </>
  )
}

const FeedbackTargetItem = ({ feedbackTarget, divider }) => {
  const classes = useStyles()
  const { t } = useTranslation()

  const { closesAt, opensAt } = feedbackTarget

  const periodInfo = t('feedbackOpenPeriod', {
    opensAt: formatDate(opensAt),
    closesAt: formatDate(closesAt),
  })

  return (
    <ListItem className={classes.listItem} divider={divider} disableGutters>
      <ListItemText primary={periodInfo} />
      <Box ml={2} display="flex">
        <ActionsButton feedbackTarget={feedbackTarget} />
      </Box>
    </ListItem>
  )
}

export default FeedbackTargetItem
