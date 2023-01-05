import { Box, Card, CardContent, Typography } from '@mui/material'
import _ from 'lodash'
import { useSnackbar } from 'notistack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import useQuestionPublicityMutation from '../../../hooks/useQuestionPublicityMutation'
import { getLanguageValue } from '../../../util/languageUtils'
import InfoBox from '../../common/InfoBox'
import QuestionPublicityToggle from '../../PublicQuestions/QuestionPublicityToggle'
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

  const label = getLanguageValue(question?.data?.label, i18n.language)
  const description = getLanguageValue(question?.data?.description, i18n.language)

  return (
    <Card sx={{ borderRadius: '1rem' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Typography variant="body1">{label}</Typography>
            <Box mb="0.5rem" />
            <Typography variant="body2">{description}</Typography>
          </Box>
          {isResponsibleTeacher && (
            <>
              <QuestionPublicityToggle
                checked={isPublic}
                disabled={disabled}
                onChange={() => onPublicityToggle(!isPublic)}
              />
              {question.type === 'OPEN' && (
                <InfoBox
                  label={t('feedbackTargetResults:hidingFeatureInfoTitle')}
                  content={t('feedbackTargetResults:hidingFeatureInfo')}
                />
              )}
            </>
          )}
        </Box>
        <Box>{content}</Box>
      </CardContent>
    </Card>
  )
}

export default QuestionItem
