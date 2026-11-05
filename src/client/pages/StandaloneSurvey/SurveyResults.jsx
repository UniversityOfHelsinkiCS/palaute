import { Alert, Box, Chip, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { LoadingProgress } from '../../components/common/LoadingProgress'
import ChartTableToggle, { useShowTable } from '../FeedbackTarget/tabs/Results/ChartTableToggle'
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
  const [showTable, setShowTable] = useShowTable()
  useChartConfig()

  if (isLoading) return <LoadingProgress />

  const responseCount = results?.responseCount ?? 0

  return (
    <Box id="feedback-target-tab-content">
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 'auto' }}>
          <Typography>{t('feedbackTargetView:respondents')}:</Typography>
          <Chip
            label={responseCount}
            color={responseCount ? 'primary' : 'default'}
            variant={responseCount ? 'filled' : 'outlined'}
            sx={{ px: '6px' }}
          />
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {responseCount > 0 && (
            <ChartTableToggle showTable={showTable} setShowTable={setShowTable} color="secondary" />
          )}
          {exportMenu}
        </Box>
      </Box>
      {responseCount === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          {t('standaloneSurvey:noAnswersYet')}
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
          showTable={showTable}
        />
      )}
    </Box>
  )
}

export default SurveyResults
