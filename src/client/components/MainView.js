import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Container } from '@material-ui/core'

import CourseListItem from './CourseListItem'

import { getCoursesAction } from '../util/redux/courseReducer'
import { getUserFeedbackAction } from '../util/redux/feedbackReducer'

export default () => {
  const dispatch = useDispatch()
  const courses = useSelector((state) => state.courses)
  const answers = useSelector((state) => state.feedback)

  useEffect(() => {
    dispatch(getCoursesAction())
  }, [])

  useEffect(() => {
    dispatch(getUserFeedbackAction())
  }, [answers.userData.length])

  if (courses.pending || answers.pending) return null

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

  answers.userData.forEach((answer) => {
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
