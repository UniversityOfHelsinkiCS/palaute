import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Typography, Box, Button, Card, CardContent, Alert } from '@mui/material'
import { grey } from '@mui/material/colors'

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
    backgroundColor: grey[50],
    borderRadius: '0.8rem',
  }),
}

const FeedbackTargetResults = ({ feedbackTarget }) => {
  const { t } = useTranslation()

  const { accessStatus, feedbackResponse, id } = feedbackTarget

  const isTeacher = accessStatus === 'TEACHER' || accessStatus === 'RESPONSIBLE_TEACHER'

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

        {isTeacher && !feedbackResponse && (
          <Box mt={2}>
            <Button variant="contained" color="primary" component={Link} to={`/targets/${id}/edit-feedback-response`}>
              {t('feedbackTargetResults:giveResponse')}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default FeedbackTargetResults
