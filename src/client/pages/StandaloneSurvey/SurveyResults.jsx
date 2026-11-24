import { Alert, Box, Card, CardContent, Chip, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { LoadingProgress } from '../../components/common/LoadingProgress'
import { boxPrintStyle } from '../../util/printStyle'
import ChartTableToggle, { useShowTable } from '../FeedbackTarget/tabs/Results/ChartTableToggle'
import OrderedQuestionResults from '../FeedbackTarget/tabs/Results/OrderedQuestionResults'
import { MAX_WIDTH } from '../FeedbackTarget/tabs/Results/OrderedQuestionResults/layout'
import ResultsButtons from '../FeedbackTarget/tabs/Results/ResultsButtons'

const SurveyResults = ({
  questions,
  publicQuestionIds,
  results,
  isLoading,
  isOpen,
  isResponsibleUser = false,
  setQuestionPublicity,
  openAnswerActions,
  exportMenu,
  groupSelector,
}) => {
  const { t } = useTranslation()
  const [showTable, setShowTable] = useShowTable()

  if (isLoading) return <LoadingProgress />

  const responseCount = results?.responseCount ?? 0

  return (
    <Card id="feedback-target-tab-content" sx={boxPrintStyle}>
      <CardContent sx={{ px: { md: 3 }, pt: { md: 3 } }}>
        <Box sx={{ maxWidth: MAX_WIDTH }}>
          {groupSelector && <Box sx={{ mb: 2 }}>{groupSelector}</Box>}
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
            <ResultsButtons>
              {responseCount > 0 && (
                <ChartTableToggle showTable={showTable} setShowTable={setShowTable} color="secondary" />
              )}
              {exportMenu}
            </ResultsButtons>
          </Box>
          {responseCount === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              {t('standaloneSurvey:noAnswersYet')}
            </Alert>
          ) : (
            <OrderedQuestionResults
              publicityConfigurableQuestionIds={
                isResponsibleUser ? questions.filter(q => q.secondaryType !== 'GROUPING').map(q => q.id) : []
              }
              publicQuestionIds={publicQuestionIds}
              questions={questions}
              feedbacks={results.feedbacks}
              isResponsibleTeacher={isResponsibleUser}
              isOrganisationUser={false}
              isOpen={isOpen}
              feedbackCount={responseCount}
              setQuestionPublicity={setQuestionPublicity}
              openAnswerActions={openAnswerActions}
              showTable={showTable}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default SurveyResults
