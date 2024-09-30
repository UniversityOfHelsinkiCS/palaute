import React, { useMemo } from 'react'
import { groupBy } from 'lodash-es'

import { Box, Typography, Chip } from '@mui/material'
import { useTranslation } from 'react-i18next'

import QuestionItem from './QuestionItem'

const QuestionSection = ({ title, count, children, ...props }) => (
  <Box my="3rem" display="flex" flexDirection="column" rowGap="1rem" {...props}>
    <Box display="flex" gap="1rem" mb="1rem" alignItems="center">
      <Typography component="h2" variant="h6" sx={{ fontWeight: 'medium' }}>
        {title}
      </Typography>
      <Chip label={count} variant="outlined" size="small" />
    </Box>
    {children}
  </Box>
)

const INCLUDED_TYPES = ['MULTIPLE_CHOICE', 'SINGLE_CHOICE', 'LIKERT', 'OPEN']

const getQuestionsWithFeedback = (questions, questionOrder, feedbacks) => {
  if (!questions) {
    return []
  }

  const feedbacksArray = feedbacks ?? []

  const feedbackData = feedbacksArray
    .reduce(
      (acc, feedback) => [
        ...acc,
        ...(Array.isArray(feedback.data) ? feedback.data.map(d => ({ ...d, feedbackId: feedback.id })) : []),
      ],
      []
    ) // filter short answers which are not a number, or answers that are blank
    .filter(answer => {
      const isNumber = !Number.isNaN(parseInt(answer.data, 10))
      const isArray = Array.isArray(answer.data)
      const arrayLength = isArray ? answer.data.length : 0
      return isNumber || arrayLength > 0 || answer.data?.trim?.().length > 1
    })

  const feedbackDataByQuestionId = groupBy(feedbackData, ({ questionId }) => questionId ?? '_')

  return questionOrder
    ? questionOrder
        .map(id => questions.find(q => q.id === id))
        .filter(q => INCLUDED_TYPES.includes(q?.type))
        .map(q => ({
          ...q,
          feedbacks: feedbackDataByQuestionId[q.id] ?? [],
        }))
    : questions
        .filter(q => INCLUDED_TYPES.includes(q?.type))
        .map(q => ({
          ...q,
          feedbacks: feedbackDataByQuestionId[q.id] ?? [],
        }))
}

const QuestionResults = React.memo(
  ({
    publicityConfigurableQuestionIds,
    publicQuestionIds,
    questions,
    questionOrder,
    feedbacks,
    isResponsibleTeacher,
    isOrganisationUser,
    isOpen,
    feedbackCount,
    feedbackTargetId,
  }) => {
    const { t } = useTranslation()

    const questionsWithFeedbacks = useMemo(
      () => getQuestionsWithFeedback(questions, questionOrder, feedbacks),
      [questions, feedbacks, publicQuestionIds]
    )

    const openQuestions = questionsWithFeedbacks.filter(
      q => q.type === 'OPEN' && (isOrganisationUser || isResponsibleTeacher || publicQuestionIds.includes(q.id))
    )

    const notOpenQuestions = questionsWithFeedbacks.filter(
      q => q.type !== 'OPEN' && (isOrganisationUser || isResponsibleTeacher || publicQuestionIds.includes(q.id))
    )

    return (
      <>
        <QuestionSection
          title={t('questionResults:multipleChoiceQuestions')}
          count={notOpenQuestions.length}
          data-cy={`feedback-target-results-multiple-choice-questions-${notOpenQuestions.length}`}
          sx={{
            '@media print': {
              pageBreakBefore: 'always',
              pageBreakAfter: 'always',
            },
          }}
        >
          <Typography variant="body2">{t('questionResults:multipleChoiceScale')}</Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              '@media print': {
                mt: '1rem',
                pageBreakAfter: 'always',
              },
            }}
          >
            {notOpenQuestions.map(q => (
              <Box
                key={q.id}
                sx={theme => ({
                  width: '25%',
                  padding: '0.5rem',
                  [theme.breakpoints.down('xl')]: {
                    width: '33%',
                  },
                  [theme.breakpoints.down('lg')]: {
                    width: '50%',
                  },
                  [theme.breakpoints.down('md')]: {
                    width: '50%',
                  },
                  [theme.breakpoints.down('sm')]: {
                    width: '100%',
                  },
                  '@media print': {
                    width: '33%',
                    pageBreakInside: 'avoid',
                    display: 'inline-block',
                  },
                })}
              >
                <QuestionItem
                  question={q}
                  publicQuestionIds={publicQuestionIds}
                  disabled={!publicityConfigurableQuestionIds?.includes(q.id)}
                  isResponsibleTeacher={isResponsibleTeacher}
                  feedbackCount={feedbackCount}
                  feedbackTargetId={feedbackTargetId}
                />
              </Box>
            ))}
          </Box>
        </QuestionSection>

        <Box sx={{ '@media print': { pageBreakBefore: 'always' } }} />

        {openQuestions.length > 0 && (
          <QuestionSection
            title={t('questionResults:openQuestions')}
            count={openQuestions.length}
            data-cy={`feedback-target-results-open-questions-${openQuestions.length}`}
            sx={{
              '@media print': {
                pageBreakBefore: 'always',
              },
            }}
          >
            {openQuestions.map(q => (
              <Box
                key={q.id}
                sx={{
                  '@media print': {
                    mt: '1rem',
                    display: 'block',
                    pageBreakAfter: 'always',
                  },
                }}
              >
                <QuestionItem
                  question={q}
                  publicQuestionIds={publicQuestionIds}
                  disabled={isOpen || !publicityConfigurableQuestionIds?.includes(q.id)}
                  isResponsibleTeacher={isResponsibleTeacher}
                  feedbackCount={feedbackCount}
                  feedbackTargetId={feedbackTargetId}
                />
              </Box>
            ))}
          </QuestionSection>
        )}
      </>
    )
  }
)

export default QuestionResults
