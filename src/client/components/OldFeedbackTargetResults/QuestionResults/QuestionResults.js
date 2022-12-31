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
  Alert,
} from '@mui/material'
import { useTranslation, Trans } from 'react-i18next'
import { Link } from 'react-router-dom'

import { getQuestionsWithFeedback } from './utils'
import LikertResults from './LikertResults'
import MultipleChoiceResults from './MultipleChoiceResults'
import SingleChoiceResults from './SingleChoiceResults'
import OpenResults from './OpenResults'
import AlertLink from '../../common/AlertLink'

const styles = {
  openQuestionItem: {
    marginBottom: theme => theme.spacing(2),
  },
  container: {
    marginBottom: theme => theme.spacing(2),
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
    fontWeight: theme => theme.typography.fontWeightMedium,
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
}

const componentByType = {
  LIKERT: LikertResults,
  MULTIPLE_CHOICE: MultipleChoiceResults,
  SINGLE_CHOICE: SingleChoiceResults,
  OPEN: OpenResults,
}

const QuestionItem = ({ question, isResponsibleTeacher, isPublic, sx }) => {
  const Component = componentByType[question.type]

  const content = Component ? <Component question={question} /> : null

  return (
    <Card sx={sx}>
      <CardContent>
        {isResponsibleTeacher && (
          <Box mb={2} sx={styles.hidePrint}>
            <Alert severity="info">
              {isPublic ? (
                <Trans i18nKey="questionResults:publicInfo">
                  The results from this question are visibile to students.{' '}
                </Trans>
              ) : (
                <Trans i18nKey="questionResults:notPublicInfo">
                  The results from this question are not visibile to students.{' '}
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

const HiddenQuestionsList = ({ hiddenQuestions }) => {
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const infoSite = 'https://wiki.helsinki.fi/display/CF/4.+Degree+program%27s+guide'

  const infoLink = (
    <AlertLink sx={styles.link} component={MuiLink} href={infoSite} target="_blank" rel="noreferrer">
      {t('questionResults:here')}
    </AlertLink>
  )

  return (
    <Card sx={styles.container}>
      <CardContent>
        <Typography variant="h6" component="h2">
          {t('questionResults:publicityOfQuestions')}
        </Typography>
        <Typography variant="body2">
          {t('questionResults:moreInfo')} {infoLink}
        </Typography>
        <List sx={styles.list}>
          {hiddenQuestions.map((question, index) => (
            <ListItem divider={index < hiddenQuestions.length - 1} disableGutters key={index}>
              <ListItemText primary={question.data.label[language]} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}

const QuestionResults = ({ publicQuestionIds, questions, feedbacks, isResponsibleTeacher, organisationAccess }) => {
  const questionsWithFeedbacks = useMemo(
    () => getQuestionsWithFeedback(questions, feedbacks, publicQuestionIds),
    [questions, feedbacks, publicQuestionIds]
  )

  const openQuestions = questionsWithFeedbacks.filter(
    q => q.type === 'OPEN' && (isResponsibleTeacher || publicQuestionIds.includes(q.id))
  )

  const notOpenQuestions = questionsWithFeedbacks.filter(
    q => q.type !== 'OPEN' && (isResponsibleTeacher || publicQuestionIds.includes(q.id))
  )

  const hiddenQuestions = questionsWithFeedbacks.filter(q => !publicQuestionIds.includes(q.id))

  return (
    <>
      <div>
        {openQuestions.map(q => (
          <QuestionItem
            key={q.id}
            question={q}
            isPublic={publicQuestionIds.includes(q.id)}
            isResponsibleTeacher={isResponsibleTeacher}
            sx={styles.openQuestionItem}
          />
        ))}
      </div>
      {organisationAccess && hiddenQuestions.length > 0 && <HiddenQuestionsList hiddenQuestions={hiddenQuestions} />}
      <Grid spacing={2} container sx={styles.displayStyle}>
        {notOpenQuestions.map(q => (
          <Grid key={q.id} xs={12} sm={12} md={6} item>
            <QuestionItem
              question={q}
              isPublic={publicQuestionIds.includes(q.id)}
              isResponsibleTeacher={isResponsibleTeacher}
            />
          </Grid>
        ))}
      </Grid>
    </>
  )
}

export default QuestionResults
