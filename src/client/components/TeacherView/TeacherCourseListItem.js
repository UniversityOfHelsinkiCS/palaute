import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box, Button } from '@material-ui/core'

import { getLanguageValue } from '../../util/languageUtils'

const TeacherCourseListItem = ({ course }) => {
  const { t, i18n } = useTranslation()

  return (
    <Box maxWidth="md" border={2} borderRadius={10} m={2} padding={2}>
      <h4>{getLanguageValue(course.name, i18n.language)}</h4>
      <h5>{course.courseCode}</h5>
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to={`/courses/${course.courseCode}/edit`}
      >
        {t('teacherView:modifyForm')}
      </Button>
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to={`/view/${course.id}`}
      >
        {t('teacherView:viewFeedbackSummary')}
      </Button>
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to={`/courses/${course.courseCode}/targets`}
      >
        {t('teacherView:viewFeedbackTargets')}
      </Button>
    </Box>
  )
}

export default TeacherCourseListItem
