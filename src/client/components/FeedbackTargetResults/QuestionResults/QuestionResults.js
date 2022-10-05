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
  Paper,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

import { getQuestionsWithFeedback } from './utils'
import LikertResults from './LikertResults'
import MultipleChoiceResults from './MultipleChoiceResults'
import SingleChoiceResults from './SingleChoiceResults'
import OpenResults from './OpenResults'
import AlertLink from '../../common/AlertLink'
import { getLanguageValue } from '../../../util/languageUtils'
import LinkChip from '../../common/LinkChip'

const styles = {
  openQuestionItem: {
    marginBottom: (theme) => theme.spacing(2),
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
    fontWeight: (theme) => theme.typography.fontWeightMedium,
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

const QuestionItem = ({
  question,
  isTeacher,
  t,
  isPublic,
  sx,
  feedbackCount,
  feedbackTargetId,
}) => {
  const Component = componentByType[question.type]

  const content = Component ? (
    <Component question={question} feedbackCount={feedbackCount} />
  ) : null

  return (
    <Box sx={sx} m="1rem">
      {isTeacher && (
        <Box my="1rem">
          <LinkChip
            label={isPublic ? t('common:public') : t('common:notPublic')}
            to={`/targets/${feedbackTargetId}/settings#public-questions`}
          />
        </Box>
      )}
      <Box>{content}</Box>
    </Box>
  )
}

const HiddenQuestionsList = ({ hiddenQuestions }) => {
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const infoSite =
    'https://wiki.helsinki.fi/display/CF/4.+Degree+program%27s+guide'

  const infoLink = (
    <AlertLink
      sx={styles.link}
      component={MuiLink}
      href={infoSite}
      target="_blank"
      rel="noreferrer"
    >
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

const QuestionSection = ({ title, children }) => (
  <Paper>
    <Box my="3rem" p="1rem">
      <Typography component="h4" variant="h6">
        {title}
      </Typography>
      {children}
    </Box>
  </Paper>
)

const QuestionResults = ({
  publicQuestionIds,
  questions,
  feedbacks,
  isTeacher,
  organisationAccess,
  feedbackCount,
  feedbackTargetId,
}) => {
  const questionsWithFeedbacks = useMemo(
    () => getQuestionsWithFeedback(questions, feedbacks, publicQuestionIds),
    [questions, feedbacks, publicQuestionIds],
  )

  const { t, i18n } = useTranslation()

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
      <QuestionSection title={t('questionResults:multipleChoiceQuestions')}>
        <Grid spacing={2} container sx={styles.displayStyle}>
          {notOpenQuestions.map((q) => (
            <Grid item key={q.id} xs={12} sm={6} lg={4} xl={3}>
              <QuestionItem
                question={q}
                isPublic={publicQuestionIds.includes(q.id)}
                isTeacher={isTeacher}
                t={t}
                feedbackCount={feedbackCount}
                feedbackTargetId={feedbackTargetId}
              />
            </Grid>
          ))}
        </Grid>
      </QuestionSection>
      {openQuestions.map((q) => (
        <QuestionSection
          title={getLanguageValue(q.data.label, i18n.language)}
          key={q.id}
        >
          <QuestionItem
            question={q}
            isPublic={publicQuestionIds.includes(q.id)}
            isTeacher={isTeacher}
            t={t}
            sx={styles.openQuestionItem}
            feedbackTargetId={feedbackTargetId}
          />
        </QuestionSection>
      ))}
      {organisationAccess && hiddenQuestions.length > 0 && (
        <HiddenQuestionsList hiddenQuestions={hiddenQuestions} />
      )}
    </>
  )
}

export default QuestionResults
