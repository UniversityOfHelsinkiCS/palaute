import React from 'react'
import { useParams } from 'react-router'

import { Container } from '@material-ui/core'

import Feedback from './FeedbackBase'

import {
  useCourseFeedback,
  useCourseQuestions,
  useCourseData,
} from '../util/queries'

const FeedbackList = () => {
  const courseId = useParams().id

  const courseData = useCourseData(courseId)
  const feedbacks = useCourseFeedback(courseId)
  const questions = useCourseQuestions(courseId)

  if (courseData.isLoading || feedbacks.isLoading || questions.isLoading)
    return null

  const currentCourse = courseData.data

  return (
    <Container>
      <h1>{currentCourse.name.fi}</h1>
      <h2>Annetut palautteet:</h2>
      {questions.data.data.questions.map((question) => (
        <Feedback
          question={question}
          answers={feedbacks.data.map((feedback) => feedback.data[question.id])}
          key={question.id}
        />
      ))}
    </Container>
  )
}

export default FeedbackList
