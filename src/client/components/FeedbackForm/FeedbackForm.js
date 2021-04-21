import React from 'react'
import { Box } from '@material-ui/core'

import LikertQuestion from './LikertQuestion'
import OpenQuestion from './OpenQuestion'
import SingleChoiceQuestion from './SingleChoiceQuestion'
import MultipleChoiceQuestion from './MultipleChoiceQuestion'
import Text from './Text'

const componentByType = {
  LIKERT: LikertQuestion,
  OPEN: OpenQuestion,
  MULTIPLE_CHOICE: MultipleChoiceQuestion,
  SINGLE_CHOICE: SingleChoiceQuestion,
  TEXT: Text,
}

const QuestionItem = ({ question, name }) => {
  const QuestionComponent = componentByType[question.type]

  return (
    <Box mb={2}>
      <QuestionComponent question={question} name={name} />
    </Box>
  )
}

const FeedbackForm = ({ questions = [], name = 'answers' }) => (
  <>
    {questions.map((question) => (
      <QuestionItem
        name={`${name}.${question.id.toString()}`}
        type={question.type}
        question={question}
        key={question.id}
      />
    ))}
  </>
)

export default FeedbackForm
