import React from 'react'

import {
  Box,
  Container,
  Typography,
  makeStyles,
  Card,
  CardContent,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { getLanguageValue } from '../../util/languageUtils'
import useNoadfeedbackTargets from '../../hooks/useNoadfeedbackTargets'
import GuestFeedbackTargetItem from './GuestFeedbackTargetItem'
import { LoadingProgress } from '../LoadingProgress'

const useStyles = makeStyles((theme) => ({
  heading: {
    marginBottom: theme.spacing(2),
  },
  statusTabs: {
    marginBottom: theme.spacing(2),
  },
  progressContainer: {
    padding: theme.spacing(4, 0),
    display: 'table',
    justifyContent: 'center',
  },
  courseRealisationItem: {
    marginBottom: theme.spacing(2),
  },
  container: {
    display: 'flex',
    justifyContent: 'center',
  },
}))

const GuestCourses = () => {
  const classes = useStyles()
  const { feedbackTargets, isLoading } = useNoadfeedbackTargets()
  const { i18n, t } = useTranslation()

  if (isLoading) {
    return <LoadingProgress />
  }

  if (!isLoading && !feedbackTargets) {
    return (
      <Box my={4} className={classes.container}>
        <Typography variant="h6" component="h6">
          {t('noadUser:noUser')}
        </Typography>
      </Box>
    )
  }

  const NoOpenFeedbacks = () => (
    <Box my={4} className={classes.container}>
      <Typography variant="h6" component="h6">
        {t('noadUser:noFeedback')}
      </Typography>
    </Box>
  )

  return (
    <Container>
      <Typography variant="h4" component="h1" className={classes.heading}>
        {t('userFeedbacks:mainHeading')}
      </Typography>
      {!feedbackTargets.length && <NoOpenFeedbacks />}
      {feedbackTargets.map((feedbackTarget) => {
        const { courseUnit } = feedbackTarget
        const translatedName = getLanguageValue(courseUnit.name, i18n.language)

        return (
          <Card
            className={classes.courseRealisationItem}
            key={feedbackTarget.id}
          >
            <CardContent>
              <Typography variant="h6" component="h2">
                {translatedName}
              </Typography>
              <GuestFeedbackTargetItem
                feedbackTarget={feedbackTarget}
                key={feedbackTarget.id}
              />
            </CardContent>
          </Card>
        )
      })}
    </Container>
  )
}

export default GuestCourses
