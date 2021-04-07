import React from 'react'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box, Button, ListItemText, Chip } from '@material-ui/core'
import FeedbackGivenIcon from '@material-ui/icons/Check'
import NoFeedbackGivenIcon from '@material-ui/icons/Edit'
import { format as formatDate, addDays } from 'date-fns'

import { getLanguageValue } from '../util/languageUtils'

const NewFeedback = ({ onEdit }) => {
  const { t } = useTranslation()
  return (
    <Button variant="contained" color="primary" onClick={onEdit}>
      {t('feedbackEnabledCourses:giveFeedbackButton')}
    </Button>
  )
}

const EditFeedBack = ({ onEdit, onViewSummary }) => {
  const { t } = useTranslation()
  return (
    <>
      <Button variant="contained" color="primary" onClick={onEdit}>
        {t('feedbackEnabledCourses:modifyFeedbackButton')}
      </Button>
      <Button variant="contained" color="primary" onClick={onViewSummary}>
        {t('feedbackEnabledCourses:viewFeedbackSummary')}
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

const CourseListItem = ({ course, answered }) => {
  const history = useHistory()

  const handleEditButton = () => {
    history.push(`/edit/${course.id}`)
  }

  const handleViewButton = () => {
    history.push(`/view/${course.id}`)
  }

  const { i18n } = useTranslation()

  const courseName = getLanguageValue(course.name, i18n.language)
  const feedbackEndDate = addDays(new Date(course.endDate), 14)

  return (
    <Box my={2}>
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
          <EditFeedBack
            onEdit={handleEditButton}
            onViewSummary={handleViewButton}
          />
        ) : (
          <NewFeedback onEdit={handleEditButton} />
        )}
      </Box>
    </Box>
  )
}

export default CourseListItem
