import React from 'react'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box, Button } from '@material-ui/core'

import { getLanguageValue } from '../util/languageUtils'

const TeacherCourseListItem = ({ course }) => {
  const history = useHistory()
  const { t, i18n } = useTranslation()

  const handleEditButton = () => {
    history.push(`/modify/${course.id}`)
  }

  const handleViewButton = () => {
    history.push(`/view/${course.id}`)
  }

  const handleTargetButton = () => {
    history.push(`/${course.courseCode}/targets`)
  }

  return (
    <Box maxWidth="md" border={2} borderRadius={10} m={2} padding={2}>
      <h4>{getLanguageValue(course.name, i18n.language)}</h4>
      <h5>{course.courseCode}</h5>
      <Button variant="contained" color="primary" onClick={handleEditButton}>
        {t('teacherView:modifyForm')}
      </Button>
      <Button variant="contained" color="primary" onClick={handleViewButton}>
        {t('teacherView:viewFeedbackSummary')}
      </Button>
      <Button variant="contained" color="primary" onClick={handleTargetButton}>
        {t('teacherView:viewFeedbackTargets')}
      </Button>
    </Box>
  )
}

export default TeacherCourseListItem
