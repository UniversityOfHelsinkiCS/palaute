import React, { useMemo } from 'react'
import { Typography, List, Divider } from '@material-ui/core'
import { useTranslation } from 'react-i18next'

import CourseListItem from './CourseListItem'

import { useFeedbackEnabledCourses, useUserFeedback } from '../util/queries'

const makeCoursesWithAnswer = (answers) => {
  const coursesWithAnswer = new Set()

  if (answers) {
    answers.forEach((answer) => {
      coursesWithAnswer.add(answer.courseRealisationId)
    })
  }

  return coursesWithAnswer
}

const makeCompareCourses = (coursesWithAnswer) => (a, b) => {
  if (coursesWithAnswer.has(a.id) && coursesWithAnswer.has(b.id)) {
    return a.endDate < b.endDate ? -1 : 1
  }
  if (coursesWithAnswer.has(a.id)) {
    return 1
  }
  if (coursesWithAnswer.has(b.id)) {
    return -1
  }
  return a.endDate < b.endDate ? -1 : 1
}

export default () => {
  const { t } = useTranslation()
  const courses = useFeedbackEnabledCourses()
  const answers = useUserFeedback()

  const coursesWithAnswer = useMemo(() => makeCoursesWithAnswer(answers.data), [
    answers.data,
  ])

  const compareCourses = makeCompareCourses(coursesWithAnswer)

  if (courses.isLoading || answers.isLoading) return null

  courses.data.sort(compareCourses)

  return (
    <div>
      <Typography variant="h4">
        {t('feedbackEnabledCourses:coursesHeading')}
      </Typography>
      <List>
        {courses.data.map((course) => (
          <>
            <CourseListItem
              key={course.id}
              course={course}
              answered={coursesWithAnswer.has(course.id)}
            />
            <Divider component="li" />
          </>
        ))}
      </List>
    </div>
  )
}
