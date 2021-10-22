import React from 'react'

import {
  Box,
  CircularProgress,
  Container,
  Typography,
  makeStyles,
  Card,
  CardContent,
} from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import { getLanguageValue } from '../../util/languageUtils'
import useNoadCourses from '../../hooks/useNoadCourses'
import FeedbackTargetItem from '../UserFeedbacks/FeedbackTargetItem'
import GuestFeedbackTargetItem from './GuestFeedbackTargetItem'

const useStyles = makeStyles((theme) => ({
  heading: {
    marginBottom: theme.spacing(2),
  },
  statusTabs: {
    marginBottom: theme.spacing(2),
  },
  progressContainer: {
    padding: theme.spacing(4, 0),
    display: 'flex',
    justifyContent: 'center',
  },
  courseRealisationItem: {
    marginBottom: theme.spacing(2),
  },
}))

const GuestCourses = () => {
  const classes = useStyles()
  const { courses, isLoading } = useNoadCourses()
  const { i18n, t } = useTranslation()

  if (isLoading) {
    return (
      <Box my={4}>
        <CircularProgress className={classes.progressContainer} />
      </Box>
    )
  }

  if (!isLoading && !courses.length) {
    return (
      <Container>
        <Typography>
          You dont have any courses that have feedback open
        </Typography>
      </Container>
    )
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" className={classes.heading}>
        {t('userFeedbacks:mainHeading')}
      </Typography>
      {courses.map((course) => {
        const { feedbackTarget } = course
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
