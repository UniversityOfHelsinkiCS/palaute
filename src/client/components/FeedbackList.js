import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router'

import { Container } from '@material-ui/core'

import Feedback from './FeedbackBase'

import { getCourseFeedbackAction } from '../util/redux/feedbackReducer'
// import { getCoursesAction } from '../util/redux/courseReducer'
import { getCourseQuestionsAction } from '../util/redux/questionReducer'

import { useFeedbackEnabledCourses } from '../util/queries'

const FeedbackList = () => {
  const dispatch = useDispatch()
  const courseId = useParams().id

  const courseData = useFeedbackEnabledCourses()

  const feedbacks = useSelector((state) => state.feedback.data)
  const questions = useSelector((state) => state.questions)

  useEffect(() => {
    // dispatch(getCoursesAction())
    dispatch(getCourseFeedbackAction(courseId))
  }, [])

  // we must ensure that courses have been created before getting questions
  useEffect(() => {
    dispatch(getCourseQuestionsAction(courseId))
  }, [courseData.pending])

  if (courseData.isLoading || !feedbacks || questions.pending) return null

  const currentCourse = courseData.data.find((course) => course.id === courseId)

  return (
    <Container>
      <h1>{currentCourse.name.fi}</h1>
      <h2>Annetut palautteet:</h2>
      {questions.data.questions.map((question) => (
        <Feedback
          question={question}
          answers={feedbacks.map((feedback) => feedback.data[question.id])}
          key={question.id}
        />
      ))}
    </Container>
  )
}

export default FeedbackList
