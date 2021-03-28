import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Container } from '@material-ui/core'

import MultiChoiceChart from './MultiChoiceChart'

import { getAllFeedbackAction } from '../util/redux/feedbackReducer'

import questions from '../questions.json'
import TextFeebackList from './TextFeedbackList'

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
      {questions.multichoice.map((question) => (
        <MultiChoiceChart
          question={question}
          answers={feedbacks
            .map((feedback) => feedback.data[question.id])
            .filter((number) => !Number.isNaN(number - parseInt(number, 10)))
            .map((number) => parseInt(number, 10))}
          key={question.id}
        />
      ))}
      {questions.textarea.map((question) => (
        <TextFeebackList
          question={question}
          answers={feedbacks.map((feedback) => feedback.data[question.id])}
          key={question.id}
        />
      ))}
    </Container>
  )
}

export default FeedbackList
