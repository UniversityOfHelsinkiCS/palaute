import React from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'

import { Container } from '@material-ui/core'

import { getLanguageValue } from '../util/languageUtils'

import Feedback from './FeedbackBase'

import {
  useCourseFeedback,
  useCourseQuestions,
  useCourseData,
} from '../util/queries'

const FeedbackList = () => {
  const courseId = useParams().id

  const { t, i18n } = useTranslation()

  const courseData = useCourseData(courseId)
  const feedbacks = useCourseFeedback(courseId)
  const questions = useCourseQuestions(courseId)

  if (courseData.isLoading || feedbacks.isLoading || questions.isLoading)
    return null

  const currentCourse = courseData.data

  return (
    <Container>
      <h1>{getLanguageValue(currentCourse.name, i18n.language)}</h1>
      <h2>{t('feedbackList:givenFeedbacks')}:</h2>
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
