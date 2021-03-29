import React from 'react'
import MultiChoiceChart from './MultiChoiceChart'
import TextFeebackList from './TextFeedbackList'

const mapTypeToComponent = {
  CHOICE: MultiChoiceChart,
  TEXT: TextFeebackList,
}

const Feedback = ({ question, answers }) => {
  const Component = mapTypeToComponent[question.type]
  return (
    <div>
      <h4>{question.question.fi}</h4>
      <Component answers={answers} />
    </div>
  )
}

export default Feedback
