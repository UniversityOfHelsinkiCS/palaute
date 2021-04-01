import React from 'react'

import { Container } from '@material-ui/core'

import CourseListItem from './CourseListItem'

import { useFeedbackEnabledCourses, useUserFeedback } from '../util/queries'

export default () => {
  const courses = useFeedbackEnabledCourses()
  const answers = useUserFeedback()

  if (courses.isLoading || answers.isLoading) return null

  const coursesWithAnswer = new Set()

  const compareCourses = (a, b) => {
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

  answers.data.forEach((answer) => {
    coursesWithAnswer.add(answer.courseRealisationId)
  })

  courses.data.sort(compareCourses)

  return (
    <Container>
      {courses.data.map((course) => (
        <CourseListItem
          key={course.id}
          course={course}
          answered={coursesWithAnswer.has(course.id)}
        />
      ))}
    </Container>
  )
}
