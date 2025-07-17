import React from 'react'

import { Box } from '@mui/material'
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

const styles = {
  questionItem: {
    '&:not(:last-child)': {
      marginBottom: '2rem',
    },
  },
}

const QuestionItem = ({ question, name, disabled }) => {
  const QuestionComponent = componentByType[question.type]

  return (
    <Box sx={styles.questionItem}>
      <QuestionComponent question={question} name={name} disabled={disabled} />
    </Box>
  )
}

const FeedbackForm = ({ questions = [], name = 'answers', disabled }) => (
  <div>
    {questions.map(question => (
      <QuestionItem
        name={`${name}.${question.id.toString()}`}
        type={question.type}
        question={question}
        key={question.id}
        disabled={disabled}
      />
    ))}
  </div>
)

export default FeedbackForm
