import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Typography, Box, Button, Card, CardContent, Alert, Tooltip } from '@mui/material'

import feedbackTargetIsEnded from '../../../../util/feedbackTargetIsEnded'
import { useFeedbackTargetContext } from '../../FeedbackTargetContext'
import Markdown from '../../../../components/common/Markdown'
import { boxPrintStyle } from '../../../../util/printStyle'

const FeedbackResponse = ({ feedbackTarget }) => {
  const { t } = useTranslation()

  const { isResponsibleTeacher } = useFeedbackTargetContext()
  const { id, feedbackResponse } = feedbackTarget

  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const canGiveFeedbackResponse = isEnded && isResponsibleTeacher

  return (
    <>
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
      <Card sx={{ mb: '4rem', borderRadius: '1rem', ...boxPrintStyle }}>
        <CardContent>
          {!feedbackResponse && <Alert severity="info">{t('feedbackTargetResults:noResponseInfo')}</Alert>}
          {feedbackResponse && (
            <Box sx={{ p: '1rem' }}>
              <Markdown>{feedbackResponse}</Markdown>
            </Box>
          )}

          {isResponsibleTeacher && !feedbackResponse && (
            <Tooltip title={t('feedbackTargetResults:giveResponseInfo')}>
              <Box mt={2} width="max-content">
                <Button
                  disabled={!canGiveFeedbackResponse}
                  variant="contained"
                  color="primary"
                  component={Link}
                  to={`/targets/${id}/edit-feedback-response`}
                  sx={{ '@media print': { display: 'none' } }}
                >
                  {t('feedbackTargetResults:giveResponse')}
                </Button>
              </Box>
            </Tooltip>
          )}
        </CardContent>
      </Card>
    </>
  )
}

export default FeedbackResponse
