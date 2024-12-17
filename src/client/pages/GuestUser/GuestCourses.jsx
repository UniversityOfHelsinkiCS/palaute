import React from 'react'

import { Box, Container, Typography, Card, CardContent } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { getLanguageValue } from '../../util/languageUtils'
import useNoadfeedbackTargets from '../../hooks/useNoadfeedbackTargets'
import GuestFeedbackTargetItem from './GuestFeedbackTargetItem'
import { LoadingProgress } from '../../components/common/LoadingProgress'
import useNoadUser from '../../hooks/useNoadUser'

const styles = {
  heading: {
    marginBottom: theme => theme.spacing(2),
  },
  statusTabs: {
    marginBottom: theme => theme.spacing(2),
  },
  progressContainer: {
    padding: theme => theme.spacing(4, 0),
    display: 'table',
    justifyContent: 'center',
  },
  courseRealisationItem: {
    marginBottom: theme => theme.spacing(2),
  },
  container: {
    display: 'flex',
    justifyContent: 'center',
  },
}

const NoOpenFeedbacks = ({ t }) => (
  <Box my={4} sx={styles.container}>
    <Typography variant="h6" component="h6">
      {t('noadUser:noFeedback')}
    </Typography>
  </Box>
)

const GuestCourses = () => {
  const { noadUser } = useNoadUser()
  const { feedbackTargets, isLoading } = useNoadfeedbackTargets()
  const { i18n, t } = useTranslation()

  React.useEffect(() => {
    if (!noadUser) return
    i18n.changeLanguage(noadUser.language)
  }, [noadUser])

  if (isLoading) {
    return <LoadingProgress />
  }

  if (!isLoading && !feedbackTargets) {
    return (
      <Box my={4} sx={styles.container}>
        <Typography variant="h6" component="h6">
          {t('noadUser:noUser')}
        </Typography>
      </Box>
    )
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" sx={styles.heading}>
        {t('userFeedbacks:mainHeading')}
      </Typography>
      {!feedbackTargets.length && <NoOpenFeedbacks t={t} />}
      {feedbackTargets.map(feedbackTarget => {
        const { courseUnit } = feedbackTarget
        const translatedName = getLanguageValue(courseUnit.name, i18n.language)

        return (
          <Card sx={styles.courseRealisationItem} key={feedbackTarget.id}>
            <CardContent>
              <Typography variant="h6" component="h2">
                {courseUnit.courseCode} {translatedName}
              </Typography>
              <GuestFeedbackTargetItem feedbackTarget={feedbackTarget} key={feedbackTarget.id} />
            </CardContent>
          </Card>
        )
      })}
    </Container>
  )
}

export default GuestCourses
