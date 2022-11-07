import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Alert,
} from '@mui/material'

import Markdown from '../common/Markdown'

const styles = {
  title: {
    marginBottom: (theme) => theme.spacing(2),
  },
}

const FeedbackTargetResults = ({ feedbackTarget }) => {
  const { t } = useTranslation()

  const { accessStatus, feedbackResponse, id } = feedbackTarget

  const isTeacher = accessStatus === 'TEACHER'

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h2" sx={styles.title}>
          {t('feedbackTargetResults:responseHeading')}
        </Typography>

        {!feedbackResponse && (
          <Alert severity="info">
            {t('feedbackTargetResults:noResponseInfo')}
          </Alert>
        )}

        {feedbackResponse && <Markdown>{feedbackResponse}</Markdown>}

        {isTeacher && (
          <Box mt={2}>
            {!feedbackResponse && (
              <Button
                variant="contained"
                color="primary"
                component={Link}
                to={`/targets/${id}/edit-feedback-response`}
              >
                {t('feedbackTargetResults:giveResponse')}
              </Button>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default FeedbackTargetResults
