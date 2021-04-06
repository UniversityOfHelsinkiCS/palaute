import React from 'react'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box, Button } from '@material-ui/core'

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

const CourseListItem = ({ course, answered }) => {
  const history = useHistory()

  const handleEditButton = () => {
    history.push(`/edit/${course.id}`)
  }

  const handleViewButton = () => {
    history.push(`/view/${course.id}`)
  }

  const { i18n } = useTranslation()

  return (
    <Box maxWidth="md" border={2} borderRadius={10} m={2} padding={2}>
      <h4>{getLanguageValue(course.name, i18n.language)}</h4>
      {answered ? (
        <EditFeedBack
          onEdit={handleEditButton}
          onViewSummary={handleViewButton}
        />
      ) : (
        <NewFeedback onEdit={handleEditButton} />
      )}
    </Box>
  )
}

export default CourseListItem
