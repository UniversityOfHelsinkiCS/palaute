import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box, Button, ListItemText, Chip } from '@material-ui/core'
import FeedbackGivenIcon from '@material-ui/icons/Check'
import NoFeedbackGivenIcon from '@material-ui/icons/Edit'
import { format as formatDate, addDays } from 'date-fns'

import { getLanguageValue } from '../../util/languageUtils'

const NewFeedback = ({ editPath }) => {
  const { t } = useTranslation()
  return (
    <Button variant="contained" color="primary" component={Link} to={editPath}>
      {t('userFeedbacks:giveFeedbackButton')}
    </Button>
  )
}

const EditFeedBack = ({ editPath, viewPath }) => {
  const { t } = useTranslation()
  return (
    <>
      <Button color="primary" component={Link} to={editPath}>
        {t('userFeedbacks:modifyFeedbackButton')}
      </Button>
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

const FeedbackListItem = ({ course, answered }) => {
  const { i18n } = useTranslation()

  const courseName = getLanguageValue(course.name, i18n.language)
  const feedbackEndDate = addDays(new Date(course.endDate), 14)
  const editPath = `/edit/${course.id}`
  const viewPath = `/view/${course.id}`

  return (
    <>
      <ListItemText
        primary={courseName}
        secondary={
          <>
            Feedback can be given until{' '}
            {formatDate(feedbackEndDate, 'dd.MM.yyyy')}
          </>
        }
      />
      <Box mt={2}>{answered ? <FeedbackChip /> : <NoFeedbackChip />}</Box>
      <Box mt={2}>
        {answered ? (
          <EditFeedBack editPath={editPath} viewPath={viewPath} />
        ) : (
          <NewFeedback editPath={editPath} />
        )}
      </Box>
    </>
  )
}

export default FeedbackListItem
