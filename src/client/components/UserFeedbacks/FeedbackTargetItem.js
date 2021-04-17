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

import { getLanguageValue } from '../../util/languageUtils'
import { feedbackTargetIsClosed } from './utils'

const useStyles = makeStyles((theme) => ({
  listItem: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
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
    <>
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
    </>
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

const FeedbackGivenChip = () => (
  <Chip
    variant="outlined"
    icon={<FeedbackGivenIcon />}
    label="Feedback has been given"
    color="primary"
  />
)

const NoFeedbackChip = () => (
  <Chip
    variant="outlined"
    icon={<NoFeedbackIcon />}
    label="Waiting for feedback"
  />
)

const FeedbackClosedChip = () => (
  <Chip
    variant="outlined"
    icon={<FeedbackClosedIcon />}
    label="Feedback is closed"
  />
)

const formatDate = (date) => lightFormat(date, 'd.M.yyyy')

const FeedbackTargetItem = ({ feedbackTarget }) => {
  const classes = useStyles()
  const { i18n } = useTranslation()

  const { closesAt, opensAt, name, feedbackId } = feedbackTarget
  const isEnded = new Date() > parseISO(closesAt)

  const periodInfo =
    new Date() < parseISO(opensAt)
      ? `Feedback can be given since ${formatDate(parseISO(opensAt))}`
      : `Feedback can be given until ${formatDate(parseISO(closesAt))}`

  const translatedName = getLanguageValue(name, i18n.language)
  const feedbackGiven = Boolean(feedbackId)
  const isClosed = feedbackTargetIsClosed(feedbackTarget)

  // TODO: fix
  const onDelete = () => {}
  const editPath = ''
  const viewPath = ''

  return (
    <ListItem className={classes.listItem}>
      <ListItemText primary={translatedName} secondary={periodInfo} />
      <Box mt={1}>
        {isClosed && <FeedbackClosedChip />}
        {!isClosed && feedbackGiven && <FeedbackGivenChip />}
        {!isClosed && !feedbackGiven && <NoFeedbackChip />}
      </Box>
      <Box mt={2}>
        {isEnded && <FeedbackEndedActions viewPath={viewPath} />}
        {!isClosed && feedbackGiven && (
          <FeedbackGivenActions editPath={editPath} onDelete={onDelete} />
        )}
        {!isClosed && !feedbackGiven && (
          <NoFeedbackActions editPath={editPath} />
        )}
      </Box>
    </ListItem>
  )
}

export default FeedbackTargetItem
