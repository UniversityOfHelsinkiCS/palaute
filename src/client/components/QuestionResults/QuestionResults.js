import React, { useMemo } from 'react'

import { Card, CardContent, Grid, makeStyles } from '@material-ui/core'

import { getQuestionsWithFeedback } from './utils'
import LikertResults from './LikertResults'
import MultipleChoiceResults from './MultipleChoiceResults'
import SingleChoiceResults from './SingleChoiceResults'
import OpenResults from './OpenResults'

const useStyles = makeStyles((theme) => ({
  openQuestionItem: {
    marginBottom: theme.spacing(2),
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

  const openQuestions = questionsWithFeedbacks.filter((q) => q.type === 'OPEN')
  const filteredQuestions = questionsWithFeedbacks.filter(
    (q) => q.type !== 'OPEN',
  )

  return (
    <>
      <div>
        {openQuestions.map((q) => (
          <QuestionItem
            key={q.id}
            question={q}
            className={classes.openQuestionItem}
          />
        ))}
      </div>

      <Grid spacing={2} container>
        {filteredQuestions.map((q) => (
          <Grid key={q.id} xs={12} sm={12} md={6} item>
            <QuestionItem question={q} />
          </Grid>
        ))}
      </Grid>
    </>
  )
}

export default QuestionResults
