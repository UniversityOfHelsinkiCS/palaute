import { Alert, Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { LoadingProgress } from '../../components/common/LoadingProgress'
import QuestionResults from '../FeedbackTarget/tabs/Results/QuestionResults'
import useChartConfig from '../FeedbackTarget/tabs/Results/QuestionResults/useChartConfig'

const SurveyResults = ({
  questions,
  publicQuestionIds,
  results,
  isLoading,
  isOpen,
  isResponsibleUser = false,
  savePublicQuestionIds,
  openAnswerActions,
  exportMenu,
}) => {
  const { t } = useTranslation()
  useChartConfig()

  if (isLoading) return <LoadingProgress />

  const responseCount = results?.responseCount ?? 0

  return (
    <Box id="feedback-target-tab-content">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <Typography>{t('standaloneSurvey:responseCount', { count: responseCount })}</Typography>
        {exportMenu}
      </Box>
      {responseCount === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          {t('feedbackTargetResults:notEnoughFeedbacksInfo')}
        </Alert>
      ) : (
        <QuestionResults
          publicityConfigurableQuestionIds={isResponsibleUser ? questions.map(q => q.id) : []}
          publicQuestionIds={publicQuestionIds}
          questions={questions}
          feedbacks={results.feedbacks}
          isResponsibleTeacher={isResponsibleUser}
          isOrganisationUser={false}
          isOpen={isOpen}
          feedbackCount={responseCount}
          savePublicQuestionIds={savePublicQuestionIds}
          openAnswerActions={openAnswerActions}
        />
      )}
    </Box>
  )
}

export default SurveyResults
