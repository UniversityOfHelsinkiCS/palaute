import React from 'react'
import { Box, Card, Typography } from '@mui/material'
import { sumBy, uniq } from 'lodash-es'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import useQuestionPublicityMutation from '../../../../../hooks/useQuestionPublicityMutation'
import { getLanguageValue } from '../../../../../util/languageUtils'
import InfoBox from '../../../../../components/common/InfoBox'
import QuestionPublicityToggle from '../../../../../components/common/QuestionPublicityToggle'
import AverageResult from './AverageResult'
import LikertResults from './LikertResults'
import MultipleChoiceResults from './MultipleChoiceResults'
import OpenResults from './OpenResults'
import SingleChoiceResults from './SingleChoiceResults'
import { boxPrintStyle } from '../../../../../util/printStyle'

const componentByType = {
  LIKERT: LikertResults,
  MULTIPLE_CHOICE: MultipleChoiceResults,
  SINGLE_CHOICE: SingleChoiceResults,
  OPEN: OpenResults,
}

const VisibilityInfoBox = ({ isPublic }) => {
  const { t } = useTranslation()

  const content = (
    <>
      <span>{isPublic ? t('feedbackTargetResults:unpublishingInfo') : t('feedbackTargetResults:publishingInfo')}</span>
      <br />
      <br />
      <span>{t('feedbackTargetResults:hidingFeatureInfo')}</span>
    </>
  )

  return <InfoBox label={t('feedbackTargetResults:hidingFeatureInfoTitle')} content={content} />
}

const QuestionItem = ({
  question,
  isResponsibleTeacher,
  publicQuestionIds,
  feedbackCount,
  disabled,
  feedbackTargetId,
}) => {
  const { t, i18n } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const mutation = useQuestionPublicityMutation({
    resource: 'feedbackTarget',
    resourceId: feedbackTargetId,
  })

  const onPublicityToggle = React.useCallback(
    async isPublic => {
      const newPublicQuestionIds = isPublic
        ? uniq(publicQuestionIds.concat(question.id))
        : publicQuestionIds.filter(id => id !== question.id)

      try {
        await mutation.mutateAsync(newPublicQuestionIds)
        enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })
      } catch (error) {
        enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
      }
    },
    [publicQuestionIds]
  )

  const handlePublicityToggle = isPublic => {
    if (isPublic) {
      onPublicityToggle(false)
      return
    }

    const toggleAccepted = question.type !== 'OPEN' || window.confirm(t('questionResults:publicQuestionConfirmation'))

    if (toggleAccepted) {
      onPublicityToggle(true)
    }
  }

  const Component = componentByType[question.type]
  const content = Component ? <Component question={question} feedbackCount={feedbackCount} /> : null

  const isPublic = publicQuestionIds.includes(question.id)
  const actualAnswers = sumBy(question.feedbacks, f => (f.data ? 1 : 0))

  const label = getLanguageValue(question?.data?.label, i18n.language)
  const description = getLanguageValue(question?.data?.description, i18n.language)

  return (
    <Card
      sx={{
        height: '100%',
        p: '1rem',
        ...boxPrintStyle,
      }}
    >
      <Box display="flex" flexDirection="column" height="100%">
        <Box display="flex">
          <Box flexGrow={0} mr="auto" display="flex" flexDirection="column" rowGap="0.5rem" alignItems="start">
            {isResponsibleTeacher && (
              <QuestionPublicityToggle
                checked={isPublic}
                disabled={disabled}
                onChange={() => handlePublicityToggle(isPublic)}
              />
            )}
            <Typography component="h3" variant="body1">
              {label}
            </Typography>
            <Typography variant="body2">{description}</Typography>
            <Typography variant="caption" color="textSecondary">
              {t('questionResults:answerCount', { answers: actualAnswers, feedbacks: feedbackCount })}
            </Typography>
          </Box>
          {(question.type === 'LIKERT' || question.secondaryType === 'WORKLOAD') && (
            <Box ml="0.5rem">
              <AverageResult question={question} />
            </Box>
          )}
          {isResponsibleTeacher && question.type === 'OPEN' && <VisibilityInfoBox isPublic={isPublic} />}
        </Box>
        {content}
      </Box>
    </Card>
  )
}

export default QuestionItem
