import React, { useMemo } from 'react'

import {
  Card,
  CardContent,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Link as MuiLink,
  Chip,
  Grid,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

import { getQuestionsWithFeedback } from './utils'
import AlertLink from '../../../../../components/common/AlertLink'
import { getLanguageValue } from '../../../../../util/languageUtils'
import QuestionItem from './QuestionItem'
import { RenderProfiler } from '../../../../../components/common/RenderProfiler'

const styles = {
  list: theme => ({
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
              <ListItemText primary={getLanguageValue(question.data.label, language)} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}

const QuestionSection = ({ title, count, children, ...props }) => (
  <Box my="3rem" display="flex" flexDirection="column" rowGap="1rem" {...props}>
    <Box display="flex" gap="1rem" mb="1rem" alignItems="end">
      <Typography component="h4">{title}</Typography>
      <Chip label={count} variant="outlined" size="small" />
    </Box>
    {children}
  </Box>
)

const QuestionResults = React.memo(
  ({
    publicityConfigurableQuestionIds,
    publicQuestionIds,
    questions,
    questionOrder,
    feedbacks,
    isResponsibleTeacher,
    isOrganisationUser,
    feedbackCount,
    feedbackTargetId,
  }) => {
    const questionsWithFeedbacks = useMemo(
      () => getQuestionsWithFeedback(questions, questionOrder, feedbacks),
      [questions, feedbacks, publicQuestionIds]
    )

    const { t } = useTranslation()

    const openQuestions = questionsWithFeedbacks.filter(
      q => q.type === 'OPEN' && (isOrganisationUser || isResponsibleTeacher || publicQuestionIds.includes(q.id))
    )

    const notOpenQuestions = questionsWithFeedbacks.filter(
      q => q.type !== 'OPEN' && (isOrganisationUser || isResponsibleTeacher || publicQuestionIds.includes(q.id))
    )

    const hiddenQuestions = questionsWithFeedbacks.filter(q => !publicQuestionIds.includes(q.id))

    return (
      <>
        <QuestionSection
          title={t('questionResults:multipleChoiceQuestions')}
          count={notOpenQuestions.length}
          data-cy="multipleChoiceQuestions"
        >
          <Typography variant="body2">{t('questionResults:multipleChoiceScale')}</Typography>

          <Grid container rowSpacing={3} columnSpacing={1.5} direction="row" alignItems="stretch">
            {notOpenQuestions.map(q => (
              <Grid item key={q.id} xs={12} sm={12} md={6} lg={4} xl={3}>
                <QuestionItem
                  question={q}
                  publicQuestionIds={publicQuestionIds}
                  disabled={!publicityConfigurableQuestionIds?.includes(q.id)}
                  isResponsibleTeacher={isResponsibleTeacher}
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
          data-cy="openQuestions"
        >
          {openQuestions.map(q => (
            <QuestionItem
              key={q.id}
              question={q}
              publicQuestionIds={publicQuestionIds}
              disabled={!publicityConfigurableQuestionIds?.includes(q.id)}
              isResponsibleTeacher={isResponsibleTeacher}
              feedbackCount={feedbackCount}
              feedbackTargetId={feedbackTargetId}
              t={t}
            />
          ))}
        </QuestionSection>

        {isOrganisationUser && hiddenQuestions.length > 0 && <HiddenQuestionsList hiddenQuestions={hiddenQuestions} />}
      </>
    )
  }
)

export default QuestionResults
