import { Box, Card, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import Instructions from '../../../../../components/common/Instructions'
import QuestionPublicityToggle from '../../../../../components/common/QuestionPublicityToggle'
import { getLanguageValue } from '../../../../../util/languageUtils'
import { cardPrintStyle } from '../../../../../util/printStyle'
import { useTranslationContext } from '../../../../../util/translationContext'
import AverageResult from './AverageResult'
import LikertResults from './LikertResults'
import MultipleChoiceResults from './MultipleChoiceResults'
import OpenResults from './OpenResults'
import SingleChoiceResults from './SingleChoiceResults'
import useQuestionPublicity from './useQuestionPublicity'
import { getAcualAnswerCount } from './utils'

const componentByType = {
  LIKERT: LikertResults,
  MULTIPLE_CHOICE: MultipleChoiceResults,
  SINGLE_CHOICE: SingleChoiceResults,
  OPEN: OpenResults,
}

const VisibilityInfoBox = ({ isPublic }) => {
  const { t } = useTranslation()
  const context = useTranslationContext()

  const content = (
    <>
      <span>
        {isPublic
          ? t('feedbackTargetResults:unpublishingInfo', { context })
          : t('feedbackTargetResults:publishingInfo', { context })}
      </span>
      <br />
      <br />
      <span>{t('feedbackTargetResults:hidingFeatureInfo', { context })}</span>
    </>
  )

  return (
    <Instructions
      title={t('feedbackTargetResults:hidingFeatureInfoTitle')}
      sx={{ mt: 0, ml: 1, maxWidth: '70%', '@media print': { display: 'none' } }}
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
  disabledInfo,
  savePublicQuestionIds,
  openAnswerActions,
  showTable,
  inTabPanel = false,
}) => {
  const { t, i18n } = useTranslation()
  const { isPublic, togglePublicity } = useQuestionPublicity({ question, publicQuestionIds, savePublicQuestionIds })

  const Component = componentByType[question.type]
  const content = Component ? (
    <Component
      question={question}
      feedbackCount={feedbackCount}
      showTable={showTable}
      openAnswerActions={openAnswerActions}
    />
  ) : null

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
      variant={inTabPanel ? 'outlined' : undefined}
      sx={{
        height: '100%',
        p: '1rem',
        ...cardPrintStyle,
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
                disabledInfo={disabledInfo}
                onChange={togglePublicity}
                questionLabel={label}
              />
            )}
            <Typography id={`question-${question.id}-label`} component={inTabPanel ? 'h5' : 'h3'} variant="body1">
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
