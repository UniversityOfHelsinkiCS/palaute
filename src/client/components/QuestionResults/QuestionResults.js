import React, { useMemo } from 'react'

import { Card, CardContent, makeStyles } from '@material-ui/core'

import { getQuestionsWithFeedback } from './utils'
import LikertResults from './LikertResults'
import MultipleChoiceResults from './MultipleChoiceResults'
import SingleChoiceResults from './SingleChoiceResults'
import OpenResults from './OpenResults'

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    justifyContent: 'space-evenly',
    flexWrap: 'wrap',
  },
  questionItem: {
    marginBottom: theme.spacing(2),
    minWidth: '49%',
    maxWidth: '49%',
  },
}))

const componentByType = {
  LIKERT: LikertResults,
  MULTIPLE_CHOICE: MultipleChoiceResults,
  SINGLE_CHOICE: SingleChoiceResults,
  OPEN: OpenResults,
}

const QuestionItem = ({ question, className }) => {
  const Component = componentByType[question.type]

  const content = Component ? <Component question={question} /> : null

  return (
    <Card className={className}>
      <CardContent>{content}</CardContent>
    </Card>
  )
}

const QuestionResults = ({ questions, feedbacks }) => {
  const classes = useStyles()

  const questionsWithFeedbacks = useMemo(
    () => getQuestionsWithFeedback(questions, feedbacks),
    [questions, feedbacks],
  )

  return (
    <div className={classes.container}>
      {questionsWithFeedbacks.map((q) => (
        <QuestionItem
          key={q.id}
          question={q}
          className={classes.questionItem}
        />
      ))}
    </div>
  )
}

export default QuestionResults
