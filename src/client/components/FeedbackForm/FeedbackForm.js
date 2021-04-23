import React from 'react'
import { makeStyles } from '@material-ui/core'

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

const useStyles = makeStyles((theme) => ({
  questionItem: {
    '&:not(:last-child)': {
      marginBottom: theme.spacing(4),
    },
  },
}))

const QuestionItem = ({ question, name, className }) => {
  const QuestionComponent = componentByType[question.type]

  return (
    <div className={className}>
      <QuestionComponent question={question} name={name} />
    </div>
  )
}

const FeedbackForm = ({ questions = [], name = 'answers' }) => {
  const classes = useStyles()

  return (
    <div>
      {questions.map((question) => (
        <QuestionItem
          name={`${name}.${question.id.toString()}`}
          type={question.type}
          question={question}
          className={classes.questionItem}
          key={question.id}
        />
      ))}
    </div>
  )
}

export default FeedbackForm
