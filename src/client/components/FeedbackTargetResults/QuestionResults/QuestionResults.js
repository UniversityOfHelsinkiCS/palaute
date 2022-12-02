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
  Chip,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'
import _ from 'lodash'

import { getQuestionsWithFeedback } from './utils'
import LikertResults from './LikertResults'
import MultipleChoiceResults from './MultipleChoiceResults'
import SingleChoiceResults from './SingleChoiceResults'
import OpenResults from './OpenResults'
import AlertLink from '../../common/AlertLink'
import { getLanguageValue } from '../../../util/languageUtils'
import QuestionPublicityToggle from '../../PublicQuestions/QuestionPublicityToggle'
import useQuestionPublicityMutation from '../../../hooks/useQuestionPublicityMutation'

const styles = {
  list: (theme) => ({
    maxHeight: '800px',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: 10,
    },
    '&::-webkit-scrollbar-track': {
      borderRadius: 10,
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.primary.light,
      borderRadius: 10,
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: theme.palette.info.main,
    },
  }),
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
  publicQuestionIds,
  feedbackCount,
  disabled,
  feedbackTargetId,
}) => {
  const isPublic = publicQuestionIds.includes(question.id)

  const Component = componentByType[question.type]

  const content = Component ? (
    <Component question={question} feedbackCount={feedbackCount} />
  ) : null

  const { enqueueSnackbar } = useSnackbar()
  const mutation = useQuestionPublicityMutation({
    resource: 'feedbackTarget',
    resourceId: feedbackTargetId,
  })

  const onPublicityToggle = async (isPublic) => {
    const newPublicQuestionIds = isPublic
      ? _.uniq(publicQuestionIds.concat(question.id))
      : publicQuestionIds.filter((id) => id !== question.id)

    try {
      await mutation.mutateAsync(newPublicQuestionIds)
      enqueueSnackbar(t('saveSuccess'), { variant: 'success' })
    } catch (error) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  return (
    <Box m="1rem" mt="3rem">
      {isTeacher && (
        <QuestionPublicityToggle
          checked={isPublic}
          disabled={disabled}
          onChange={() => onPublicityToggle(!isPublic)}
        />
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
              <ListItemText
                primary={getLanguageValue(question.data.label, language)}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}

const QuestionSection = ({ title, count, children }) => (
  <Paper>
    <Box my="3rem" p="1rem">
      <Box display="flex" gap="1rem" mb="1rem" alignItems="end">
        <Typography component="h4">{title}</Typography>
        <Chip label={count} variant="outlined" size="small" />
      </Box>
      {children}
    </Box>
  </Paper>
)

const QuestionResults = ({
  publicityConfigurableQuestionIds,
  publicQuestionIds,
  questions,
  questionOrder,
  feedbacks,
  isTeacher,
  isOrganisationUser,
  feedbackCount,
  feedbackTargetId,
}) => {
  const questionsWithFeedbacks = useMemo(
    () => getQuestionsWithFeedback(questions, questionOrder, feedbacks),
    [questions, feedbacks, publicQuestionIds],
  )

  const { t } = useTranslation()

  const openQuestions = questionsWithFeedbacks.filter(
    (q) =>
      q.type === 'OPEN' &&
      (isOrganisationUser || isTeacher || publicQuestionIds.includes(q.id)),
  )

  const notOpenQuestions = questionsWithFeedbacks.filter(
    (q) =>
      q.type !== 'OPEN' &&
      (isOrganisationUser || isTeacher || publicQuestionIds.includes(q.id)),
  )

  const hiddenQuestions = questionsWithFeedbacks.filter(
    (q) => !publicQuestionIds.includes(q.id),
  )

  return (
    <>
      <QuestionSection
        title={t('questionResults:multipleChoiceQuestions')}
        count={notOpenQuestions.length}
      >
        <Typography variant="body2">
          {t('questionResults:multipleChoiceScale')}
        </Typography>

        <Grid container sx={styles.displayStyle}>
          {notOpenQuestions.map((q) => (
            <Grid item key={q.id} xs={12} sm={6} lg={4} xl={4}>
              <QuestionItem
                question={q}
                publicQuestionIds={publicQuestionIds}
                disabled={!publicityConfigurableQuestionIds?.includes(q.id)}
                isTeacher={isTeacher}
                feedbackCount={feedbackCount}
                feedbackTargetId={feedbackTargetId}
                t={t}
              />
            </Grid>
          ))}
        </Grid>
      </QuestionSection>
      <QuestionSection
        title={t('questionResults:openQuestions')}
        count={openQuestions.length}
      >
        {openQuestions.map((q) => (
          <QuestionItem
            key={q.id}
            question={q}
            publicQuestionIds={publicQuestionIds}
            disabled={!publicityConfigurableQuestionIds?.includes(q.id)}
            isTeacher={isTeacher}
            feedbackTargetId={feedbackTargetId}
            t={t}
          />
        ))}
      </QuestionSection>
      {isOrganisationUser && hiddenQuestions.length > 0 && (
        <HiddenQuestionsList hiddenQuestions={hiddenQuestions} />
      )}
    </>
  )
}

export default QuestionResults
