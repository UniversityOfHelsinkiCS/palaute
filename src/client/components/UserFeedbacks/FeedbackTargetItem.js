import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { lightFormat, parseISO } from 'date-fns'

import {
  Box,
  Button,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  ListItem,
  makeStyles,
} from '@material-ui/core'

import FeedbackGivenIcon from '@material-ui/icons/Check'
import NoFeedbackIcon from '@material-ui/icons/Edit'
import FeedbackClosedIcon from '@material-ui/icons/Lock'

import { useQueryClient } from 'react-query'
import { getLanguageValue } from '../../util/languageUtils'
import { feedbackTargetIsClosed } from './utils'
import apiClient from '../../util/apiClient'

const useStyles = makeStyles((theme) => ({
  listItem: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  actions: {
    '& > *:not(last-child)': {
      marginTop: theme.spacing(2),
    },
  },
}))

const NoFeedbackActions = ({ editPath }) => {
  const { t } = useTranslation()

  return (
    <Button variant="contained" color="primary" to={editPath} component={Link}>
      {t('userFeedbacks:giveFeedbackButton')}
    </Button>
  )
}

const FeedbackGivenActions = ({ editPath, onDelete }) => {
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
    <div>
      <Button
        color="primary"
        variant="contained"
        component={Link}
        to={editPath}
      >
        {t('userFeedbacks:modifyFeedbackButton')}
      </Button>
      <Button color="primary" onClick={handleOpen}>
        {t('userFeedbacks:clearFeedbackButton')}
      </Button>
      {/* this is for confirming the clear (according to materialui docs) */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {t('userFeedbacks:clearConfirmationQuestion')}
        </DialogTitle>
        <Button onClick={handleClose} color="primary">
          {t('userFeedbacks:no')}
        </Button>
        <Button onClick={handleSubmit} color="primary" autoFocus>
          {t('userFeedbacks:yes')}
        </Button>
      </Dialog>
    </div>
  )
}

const FeedbackEndedActions = ({ viewPath }) => {
  const { t } = useTranslation()

  return (
    <Button color="primary" variant="contained" component={Link} to={viewPath}>
      {t('userFeedbacks:viewFeedbackSummary')}
    </Button>
  )
}

const FeedbackGivenChip = () => {
  const { t } = useTranslation()

  return (
    <Chip
      variant="outlined"
      icon={<FeedbackGivenIcon />}
      label={t('userFeedbacks:feedbackGiven')}
      color="primary"
    />
  )
}

const NoFeedbackChip = () => {
  const { t } = useTranslation()

  return (
    <Chip
      variant="outlined"
      icon={<NoFeedbackIcon />}
      label={t('userFeedbacks:waitingForFeedback')}
    />
  )
}

const FeedbackClosedChip = () => {
  const { t } = useTranslation()

  return (
    <Chip
      variant="outlined"
      icon={<FeedbackClosedIcon />}
      label={t('userFeedbacks:feedbackClosed')}
    />
  )
}

const formatDate = (date) => lightFormat(date, 'd.M.yyyy')

const FeedbackTargetItem = ({ feedbackTarget, divider }) => {
  const classes = useStyles()
  const { i18n, t } = useTranslation()

  const queryClient = useQueryClient()

  const { id, closesAt, opensAt, name, feedback } = feedbackTarget
  const isEnded = new Date() > parseISO(closesAt)

  const periodInfo = t('userFeedbacks:feedbackOpenPeriod', {
    opensAt: formatDate(parseISO(opensAt)),
    closesAt: formatDate(parseISO(closesAt)),
  })

  const translatedName = getLanguageValue(name, i18n.language)
  const feedbackGiven = Boolean(feedback)
  const isClosed = feedbackTargetIsClosed(feedbackTarget)

  const onDelete = async () => {
    await apiClient.delete(`/feedbacks/${feedback.id}`)
    queryClient.invalidateQueries('feedbackTargetsForStudent')
  }

  const editPath = `${id}/edit`
  const viewPath = `${id}/view`

  return (
    <ListItem className={classes.listItem} divider={divider} disableGutters>
      <ListItemText primary={translatedName} secondary={periodInfo} />
      <Box mt={1}>
        {isClosed && <FeedbackClosedChip />}
        {!isClosed && feedbackGiven && <FeedbackGivenChip />}
        {!isClosed && !feedbackGiven && <NoFeedbackChip />}
      </Box>
      <div className={classes.actions}>
        {isEnded && <FeedbackEndedActions viewPath={viewPath} />}
        {!isClosed && feedbackGiven && (
          <FeedbackGivenActions editPath={editPath} onDelete={onDelete} />
        )}
        {!isClosed && !feedbackGiven && (
          <NoFeedbackActions editPath={editPath} />
        )}
      </div>
    </ListItem>
  )
}

export default FeedbackTargetItem
