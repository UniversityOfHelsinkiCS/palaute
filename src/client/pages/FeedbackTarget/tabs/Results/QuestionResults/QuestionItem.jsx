import React from 'react'
import { Box, Card, Typography } from '@mui/material'
import { uniq } from 'lodash-es'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import useQuestionPublicityMutation from '../../../../../hooks/useQuestionPublicityMutation'
import { getLanguageValue } from '../../../../../util/languageUtils'
import QuestionPublicityToggle from '../../../../../components/common/QuestionPublicityToggle'
import AverageResult from './AverageResult'
import LikertResults from './LikertResults'
import MultipleChoiceResults from './MultipleChoiceResults'
import OpenResults from './OpenResults'
import SingleChoiceResults from './SingleChoiceResults'
import Instructions from '../../../../../components/common/Instructions'
import { boxPrintStyle } from '../../../../../util/printStyle'
import { getAcualAnswerCount } from './utils'

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

  return (
    <Instructions
      title={t('feedbackTargetResults:hidingFeatureInfoTitle')}
      sx={{ mt: 0, ml: 1, maxWidth: '70%', '@media print': { display: 'none' } }}
      collapseProps={{ enter: false, exit: false }}
    >
      {content}
    </Instructions>
  )
}

const QuestionItem = ({
  question,
  isResponsibleTeacher,
  publicQuestionIds,
  feedbackCount,
  disabled,
  feedbackTargetId,
  showTable,
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
      } catch {
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
  const content = Component ? (
    <Component question={question} feedbackCount={feedbackCount} showTable={showTable} />
  ) : null

  const isPublic = publicQuestionIds.includes(question.id)
  const acualAnswerCount = getAcualAnswerCount(question)

  const label = getLanguageValue(question?.data?.label, i18n.language)
  const description = getLanguageValue(question?.data?.description, i18n.language)

  let descriptionId
  if (description) {
    descriptionId = `question-${question.id}-description`
  } else if (question.type === 'LIKERT') {
    descriptionId = 'likert-explanation'
  }

  return (
    <Card
      sx={{
        height: '100%',
        p: '1rem',
        ...boxPrintStyle,
      }}
    >
      <Box
        component="section"
        aria-labelledby={`question-${question.id}-label`}
        aria-describedby={descriptionId}
        display="flex"
        flexDirection="column"
        height="100%"
      >
        <Box display="flex">
          <Box flexGrow={0} mr="auto" display="flex" flexDirection="column" rowGap="0.5rem" alignItems="start">
            {isResponsibleTeacher && (
              <QuestionPublicityToggle
                questionId={question.id}
                checked={isPublic}
                disabled={disabled}
                onChange={() => handlePublicityToggle(isPublic)}
              />
            )}
            <Typography id={`question-${question.id}-label`} component="h3" variant="body1">
              {label}
            </Typography>
            {description && (
              <Typography id={`question-${question.id}-description`} variant="body2">
                {description}
              </Typography>
            )}
            <Typography variant="caption" color="textSecondary">
              {t('questionResults:answerCount', { answers: acualAnswerCount, feedbacks: feedbackCount })}
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
