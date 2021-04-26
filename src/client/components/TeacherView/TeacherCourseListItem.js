import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box, Button, Typography } from '@material-ui/core'

import { getLanguageValue } from '../../util/languageUtils'

const TeacherCourseListItem = ({ course }) => {
  const { t, i18n } = useTranslation()

  return (
    <>
      <Box maxWidth="md" border={1} borderRadius={10} m={1} padding={2}>
        <Typography variant="h5" component="h3">
          {getLanguageValue(course.name, i18n.language)}
        </Typography>
        <Typography variant="h6" component="h4">
          {course.courseCode}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="small"
          component={Link}
          style={{ marginRight: 5 }}
          to={`/courses/${course.courseCode}/edit`}
        >
          {t('teacherView:modifyForm')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="small"
          component={Link}
          style={{ marginRight: 5 }}
          to={`/courses/${course.courseCode}/targets`}
        >
          {t('teacherView:viewFeedbackTargets')}
        </Button>
      </Box>
    </>
  )
}

export default TeacherCourseListItem

/*
<Button
          variant="contained"
          color="primary"
          size="small"
          component={Link}
          style={{ marginRight: 5 }}
          to={`/view/${course.id}`}
        >
          {t('teacherView:viewFeedbackSummary')}
        </Button>
*/
