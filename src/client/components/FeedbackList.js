import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Container } from '@material-ui/core'

import Feedback from './FeedbackBase'

import { getAllFeedbackAction } from '../util/redux/feedbackReducer'

import questions from '../questions.json'

const FeedbackList = () => {
  const dispatch = useDispatch()
  const feedbacks = useSelector((state) => state.feedback.data)

  useEffect(() => {
    dispatch(getAllFeedbackAction())
  }, [feedbacks.length])

  if (!feedbacks.length) return null

  return (
    <Container>
      <h1>Annetut palautteet:</h1>
      {questions.questions.map((question) => (
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
