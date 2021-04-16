import React, { useState, useMemo } from 'react'
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
import NoFeedbackGivenIcon from '@material-ui/icons/Edit'

import { getLanguageValue } from '../../util/languageUtils'

const useStyles = makeStyles((theme) => ({
  listItem: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}))

const NewFeedback = ({ editPath }) => {
  const { t } = useTranslation()
  return (
    <Button variant="contained" color="primary" component={Link} to={editPath}>
      {t('userFeedbacks:giveFeedbackButton')}
    </Button>
  )
}

const EditFeedback = ({ editPath, viewPath, onDelete }) => {
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
      <Button color="primary" component={Link} to={editPath}>
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
      <Button color="primary" component={Link} to={viewPath}>
        {t('userFeedbacks:viewFeedbackSummary')}
      </Button>
    </>
  )
}

const FeedbackChip = () => (
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
    icon={<NoFeedbackGivenIcon />}
    label="Waiting for feedback"
  />
)

const FeedbackListItem = ({ courseRealisation }) => {
  const classes = useStyles()
  const { i18n } = useTranslation()

  const userFeedbackTargetWithoutFeedback = useMemo(
    () =>
      courseRealisation.userFeedbackTargets.find(
        ({ feedbackId }) => !feedbackId,
      ),
    [courseRealisation],
  )

  const closesAtInfo = userFeedbackTargetWithoutFeedback
    ? `Feedback can be given until ${lightFormat(
        parseISO(userFeedbackTargetWithoutFeedback.feedbackTarget.closesAt),
        'd.M.yyyy',
      )}`
    : null

  const courseRealisationName = getLanguageValue(
    courseRealisation.name,
    i18n.language,
  )

  const editPath = userFeedbackTargetWithoutFeedback
    ? `/edit/${userFeedbackTargetWithoutFeedback.id}`
    : null

  return (
    <ListItem className={classes.listItem}>
      <ListItemText primary={courseRealisationName} secondary={closesAtInfo} />
      <Box mt={1}>
        {!userFeedbackTargetWithoutFeedback ? (
          <FeedbackChip />
        ) : (
          <NoFeedbackChip />
        )}
      </Box>
      <Box mt={2}>{editPath && <NewFeedback editPath={editPath} />}</Box>
    </ListItem>
  )
}

export default FeedbackListItem
