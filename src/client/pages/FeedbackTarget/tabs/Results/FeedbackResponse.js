import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Typography, Box, Button, Card, CardContent, Alert, Tooltip } from '@mui/material'
import { grey } from '@mui/material/colors'

import feedbackTargetIsEnded from '../../../../util/feedbackTargetIsEnded'
import { useFeedbackTargetContext } from '../../FeedbackTargetContext'
import Markdown from '../../../../components/common/Markdown'

const styles = {
  title: {
    marginBottom: theme => theme.spacing(2),
  },
  responseBox: theme => ({
    paddingX: '3rem',
    [theme.breakpoints.down('md')]: {
      paddingX: '2rem',
    },
    [theme.breakpoints.down('sm')]: {
      paddingX: '1rem',
    },
    paddingTop: '2rem',
    paddingBottom: '1.5rem',
    boxShadow: `0 2px 5px 0 rgb(0 0 0 / 7%)`,
    backgroundColor: grey[50],
    borderRadius: '0.8rem',
  }),
}

const FeedbackResponse = ({ feedbackTarget }) => {
  const { t } = useTranslation()

  const { isResponsibleTeacher } = useFeedbackTargetContext()
  const { id, feedbackResponse } = feedbackTarget

  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const canGiveFeedbackResponse = isEnded && isResponsibleTeacher

  return (
    <Card sx={{ borderRadius: '1rem' }}>
      <CardContent>
        <Typography component="h2" sx={styles.title}>
          {t('feedbackTargetResults:responseHeading')}
        </Typography>

        {!feedbackResponse && <Alert severity="info">{t('feedbackTargetResults:noResponseInfo')}</Alert>}
        {feedbackResponse && (
          <Box sx={styles.responseBox}>
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
              >
                {t('feedbackTargetResults:giveResponse')}
              </Button>
            </Box>
          </Tooltip>
        )}
      </CardContent>
    </Card>
  )
}

export default FeedbackResponse
