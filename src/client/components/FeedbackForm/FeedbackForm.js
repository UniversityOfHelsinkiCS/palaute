import React from 'react'
import { useField } from 'formik'
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

const QuestionItem = ({ name, type }) => {
  const QuestionComponent = componentByType[type]

  return (
    <Box mb={2}>
      <QuestionComponent name={name} />
    </Box>
  )
}

const FeedbackForm = ({ name = 'questions' }) => {
  const [questionsField] = useField(name)
  const { value: questions = [] } = questionsField

  return (
    <>
      {questions.map((question, index) => (
        <QuestionItem
          name={`${name}.[${index}]`}
          type={question.type}
          key={question.id}
        />
      ))}
    </>
  )
}

export default FeedbackForm
