import { Box, Card, CardContent, Typography } from '@mui/material'
import _ from 'lodash'
import { useSnackbar } from 'notistack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import useQuestionPublicityMutation from '../../../../../hooks/useQuestionPublicityMutation'
import { getLanguageValue } from '../../../../../util/languageUtils'
import InfoBox from '../../../../../components/common/InfoBox'
import QuestionPublicityToggle from '../../../../../components/PublicQuestions/QuestionPublicityToggle'
import AverageResult from './AverageResult'
import LikertResults from './LikertResults'
import MultipleChoiceResults from './MultipleChoiceResults'
import OpenResults from './OpenResults'
import SingleChoiceResults from './SingleChoiceResults'

const componentByType = {
  LIKERT: LikertResults,
  MULTIPLE_CHOICE: MultipleChoiceResults,
  SINGLE_CHOICE: SingleChoiceResults,
  OPEN: OpenResults,
}

const QuestionItem = ({
  question,
  isResponsibleTeacher,
  publicQuestionIds,
  feedbackCount,
  disabled,
  feedbackTargetId,
}) => {
  const isPublic = publicQuestionIds.includes(question.id)

  const Component = componentByType[question.type]

  const content = Component ? <Component question={question} feedbackCount={feedbackCount} /> : null

  const { enqueueSnackbar } = useSnackbar()
  const { t, i18n } = useTranslation()

  const mutation = useQuestionPublicityMutation({
    resource: 'feedbackTarget',
    resourceId: feedbackTargetId,
  })

  const onPublicityToggle = async isPublic => {
    const newPublicQuestionIds = isPublic
      ? _.uniq(publicQuestionIds.concat(question.id))
      : publicQuestionIds.filter(id => id !== question.id)

    try {
      await mutation.mutateAsync(newPublicQuestionIds)
      enqueueSnackbar(t('saveSuccess'), { variant: 'success' })
    } catch (error) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const actualAnswers = _.sumBy(question.feedbacks, f => Boolean(f.data))

  const label = getLanguageValue(question?.data?.label, i18n.language)
  const description = getLanguageValue(question?.data?.description, i18n.language)

  return (
    <Card sx={{ height: '100%', p: '1rem' }}>
      <Box display="flex" flexDirection="column" height="100%">
        <Box display="flex">
          <Box flexGrow={0} mr="auto" display="flex" flexDirection="column" rowGap="0.5rem" alignItems="start">
            {isResponsibleTeacher && (
              <QuestionPublicityToggle
                checked={isPublic}
                disabled={disabled}
                onChange={() => onPublicityToggle(!isPublic)}
              />
            )}
            <Typography variant="body1">{label}</Typography>
            <Typography variant="body2">{description}</Typography>
          </Box>
          {(question.type === 'LIKERT' || question.secondaryType === 'WORKLOAD') && (
            <Box>
              <AverageResult question={question} />
            </Box>
          )}
          {isResponsibleTeacher && question.type === 'OPEN' && (
            <InfoBox
              label={t('feedbackTargetResults:hidingFeatureInfoTitle')}
              content={t('feedbackTargetResults:hidingFeatureInfo')}
            />
          )}
        </Box>
        <Box display="flex" alignItems="center" flexGrow="100">
          <Box display="flex" flexDirection="column" alignItems="center">
            {content}
            <Typography variant="caption" color="textSecondary">
              {t('questionResults:answerCount', { answers: actualAnswers, feedbacks: feedbackCount })}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  )
}

export default QuestionItem
