import React, { useMemo } from 'react'

import {
  Card,
  CardContent,
  Grid,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Link as MuiLink,
} from '@mui/material'
import { makeStyles } from '@mui/styles'
import { useTranslation, Trans } from 'react-i18next'
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
  container: {
    marginBottom: theme.spacing(2),
  },
  list: {
    maxHeight: '800px',
    overflowY: 'scroll',
    '&::-webkit-scrollbar': {
      width: 10,
    },
    '&::-webkit-scrollbar-track': {
      boxShadow: 'inset 0 0 5px grey',
      borderRadius: 10,
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#107eab',
      borderRadius: 10,
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: '#0e6e95',
    },
  },
  link: {
    fontWeight: theme.typography.fontWeightMedium,
    textDecoration: 'underline',
    color: 'black',
  },
  hidePrint: {
    display: 'inherit',
    '@media print': {
      display: 'none',
    },
  },
  displayStyle: {
    '@media print': {
      display: 'block',
    },
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
  hidePrint,
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
          <Box mb={2} className={hidePrint}>
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

const HiddenQuestionsList = ({ hiddenQuestions, classes }) => {
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const infoSite =
    'https://wiki.helsinki.fi/display/CF/4.+Degree+program%27s+guide'

  const infoLink = (
    <AlertLink
      className={classes.link}
      component={MuiLink}
      href={infoSite}
      target="_blank"
      rel="noreferrer"
    >
      {t('questionResults:here')}
    </AlertLink>
  )

  return (
    <Card className={classes.container}>
      <CardContent>
        <Typography variant="h6" component="h2">
          {t('questionResults:publicityOfQuestions')}
        </Typography>
        <Typography variant="body2">
          {t('questionResults:moreInfo')} {infoLink}
        </Typography>
        <List className={classes.list}>
          {hiddenQuestions.map((question, index) => (
            <ListItem
              divider={index < hiddenQuestions.length - 1}
              disableGutters
              key={index}
            >
              <ListItemText primary={question.data.label[language]} />
            </ListItem>
          ))}
        </List>
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
  organisationAccess,
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

  const hiddenQuestions = questionsWithFeedbacks.filter(
    (q) => !publicQuestionIds.includes(q.id),
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
            hidePrint={classes.hidePrint}
          />
        ))}
      </div>
      {organisationAccess && hiddenQuestions.length > 0 && (
        <HiddenQuestionsList
          hiddenQuestions={hiddenQuestions}
          classes={classes}
        />
      )}
      <Grid spacing={2} container className={classes.displayStyle}>
        {notOpenQuestions.map((q) => (
          <Grid key={q.id} xs={12} sm={12} md={6} item>
            <QuestionItem
              question={q}
              isPublic={publicQuestionIds.includes(q.id)}
              isTeacher={isTeacher}
              selectPublicQuestionsLink={selectPublicQuestionsLink}
              hidePrint={classes.hidePrint}
            />
          </Grid>
        ))}
      </Grid>
    </>
  )
}

export default QuestionResults
