import { Typography, Box, Card, CardContent, Alert, Tooltip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import Markdown from '../../../../components/common/Markdown'
import { NorButton } from '../../../../components/common/NorButton'
import feedbackTargetIsEnded from '../../../../util/feedbackTargetIsEnded'
import { cardPrintStyle } from '../../../../util/printStyle'
import { useFeedbackTargetContext } from '../../FeedbackTargetContext'

const FeedbackResponse = ({ feedbackTarget, inTabPanel = false }) => {
  const { t } = useTranslation()

  const { isResponsibleTeacher } = useFeedbackTargetContext()
  const { id, feedbackResponse } = feedbackTarget

  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const canGiveFeedbackResponse = isEnded && isResponsibleTeacher

  const heading = inTabPanel ? (
    <Typography component="h4" variant="subtitle1" sx={{ fontWeight: 'medium', mb: 2 }}>
      {t('feedbackTargetResults:responseHeading')}
    </Typography>
  ) : (
    <Typography
      component="h2"
      variant="h6"
      sx={{
        fontWeight: 'medium',
        mb: '2rem',
      }}
    >
      {t('feedbackTargetResults:responseHeading')}
    </Typography>
  )

  return (
    <>
      {!inTabPanel && heading}
      <Card variant={inTabPanel ? 'outlined' : undefined} sx={{ mb: '4rem', borderRadius: '1rem', ...cardPrintStyle }}>
        <CardContent>
          {inTabPanel && heading}
          {!feedbackResponse && <Alert severity="info">{t('feedbackTargetResults:noResponseInfo')}</Alert>}
          {feedbackResponse && (
            <Box sx={{ p: inTabPanel ? 0 : '1rem' }}>
              <Markdown>{feedbackResponse}</Markdown>
            </Box>
          )}

          {isResponsibleTeacher && !feedbackResponse && (
            <Tooltip title={t('feedbackTargetResults:giveResponseInfo')}>
              <Box mt={2} width="max-content">
                <NorButton
                  disabled={!canGiveFeedbackResponse}
                  color="primary"
                  component={Link}
                  to={`/targets/${id}/edit-feedback-response`}
                  sx={{ '@media print': { display: 'none' } }}
                >
                  {t('feedbackTargetResults:giveResponse')}
                </NorButton>
              </Box>
            </Tooltip>
          )}
        </CardContent>
      </Card>
    </>
  )
}

export default FeedbackResponse
