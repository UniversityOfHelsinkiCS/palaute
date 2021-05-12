import React, { useMemo } from 'react'

import { Card, CardContent, Grid, Box, makeStyles } from '@material-ui/core'
import { Trans } from 'react-i18next'
import { Link } from 'react-router-dom'

import { getQuestionsWithFeedback } from './utils'
import LikertResults from './LikertResults'
import MultipleChoiceResults from './MultipleChoiceResults'
import SingleChoiceResults from './SingleChoiceResults'
import OpenResults from './OpenResults'
import Alert from '../Alert'
import AlertLink from '../AlertLink'

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

const QuestionItem = ({
  question,
  isTeacher,
  selectPublicQuestionsLink,
  isPublic,
  className,
}) => {
  const Component = componentByType[question.type]

  const content = Component ? <Component question={question} /> : null

  const selectLink = (
    <AlertLink component={Link} to={selectPublicQuestionsLink}>
      Select public questions
    </AlertLink>
  )

  return (
    <Card className={className}>
      <CardContent>
        {isTeacher && (
          <Box mb={2}>
            <Alert severity="info">
              {isPublic ? (
                <Trans i18nKey="questionResults:publicInfo">
                  The results from this question are visibile to students.{' '}
                  {selectLink}
                </Trans>
              ) : (
                <Trans i18nKey="questionResults:notPublicInfo">
                  The results from this question are not visibile to students.{' '}
                  {selectLink}
                </Trans>
              )}
            </Alert>
          </Box>
        )}
        {content}
      </CardContent>
    </Card>
  )
}

const QuestionResults = ({
  publicQuestionIds,
  questions,
  feedbacks,
  isTeacher,
  selectPublicQuestionsLink,
}) => {
  const classes = useStyles()

  const questionsWithFeedbacks = useMemo(
    () => getQuestionsWithFeedback(questions, feedbacks, publicQuestionIds),
    [questions, feedbacks, publicQuestionIds],
  )

  const openQuestions = questionsWithFeedbacks.filter(
    (q) => q.type === 'OPEN' && (isTeacher || publicQuestionIds.includes(q.id)),
  )

  const notOpenQuestions = questionsWithFeedbacks.filter(
    (q) => q.type !== 'OPEN' && (isTeacher || publicQuestionIds.includes(q.id)),
  )

  return (
    <>
      <div>
        {openQuestions.map((q) => (
          <QuestionItem
            key={q.id}
            question={q}
            isPublic={publicQuestionIds.includes(q.id)}
            isTeacher={isTeacher}
            selectPublicQuestionsLink={selectPublicQuestionsLink}
            className={classes.openQuestionItem}
          />
        ))}
      </div>

      <Grid spacing={2} container>
        {notOpenQuestions.map((q) => (
          <Grid key={q.id} xs={12} sm={12} md={6} item>
            <QuestionItem
              question={q}
              isPublic={publicQuestionIds.includes(q.id)}
              isTeacher={isTeacher}
              selectPublicQuestionsLink={selectPublicQuestionsLink}
            />
          </Grid>
        ))}
      </Grid>
    </>
  )
}

export default QuestionResults
