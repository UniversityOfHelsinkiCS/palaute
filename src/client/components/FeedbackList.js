import React from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../util/languageUtils'

import Feedback from './FeedbackBase'

import { useCourseFeedback, useCourseQuestions } from '../util/queries'
import useUserFeedbackTarget from '../hooks/useUserFeedbackTarget'

const FeedbackList = () => {
  const { id } = useParams()

  const { t, i18n } = useTranslation()

  const { userFeedbackTarget } = useUserFeedbackTarget(id)
  const feedbacks = useCourseFeedback(id)
  const questions = useCourseQuestions(id)

  if (userFeedbackTarget || feedbacks.isLoading || questions.isLoading)
    return null

  const { feedbackTarget } = userFeedbackTarget

  return (
    <>
      <h1>{getLanguageValue(feedbackTarget.name, i18n.language)}</h1>
      <h2>{t('feedbackList:givenFeedbacks')}:</h2>
      {questions.data.data.questions.map((question) => (
        <Feedback
          question={question}
          answers={feedbacks.data.map((feedback) => feedback.data[question.id])}
          key={question.id}
        />
      ))}
    </>
  )
}

export default FeedbackList
