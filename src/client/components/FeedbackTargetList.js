import React, { useMemo } from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'

import { format, parseISO } from 'date-fns'

import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  makeStyles,
} from '@material-ui/core'

import { getLanguageValue } from '../util/languageUtils'

import useFeedbackTargets from '../hooks/useFeedbackTargets'
import {
  getCourseRealisationsWithFeedbackTargets,
  sortCourseRealisations,
} from './UserFeedbacks/utils'

const useStyles = makeStyles((theme) => ({
  listItem: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  targetName: {
    marginTop: theme.spacing(2),
  },
}))

const FeedbackTargetList = () => {
  const courseId = useParams().id

  const data = useFeedbackTargets(courseId)

  const { t } = useTranslation()

  const feedbackTargets = !data.isLoading && data.feedbackTargets

  const courseRealisations = useMemo(
    () => getCourseRealisationsWithFeedbackTargets(feedbackTargets),
    [feedbackTargets],
  )

  const sortedCourseRealations = useMemo(
    () => sortCourseRealisations(courseRealisations),
    [courseRealisations],
  )

  return (
    <div>
      <Typography variant="h4" component="h3">
        {t('feedbackTargets:title')}
      </Typography>
      <List>
        {sortedCourseRealations.length > 0 &&
          sortedCourseRealations.map((target) => (
            <RealisationFeedbackTargets key={target.id} realisation={target} />
          ))}
      </List>
    </div>
  )
}

const RealisationFeedbackTargets = ({ realisation }) => {
  const { i18n, t } = useTranslation()

  const classes = useStyles()

  return (
    <ListItem className={classes.listItem} disableGutters>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" component="h4">
            {getLanguageValue(realisation.name, i18n.language)}
          </Typography>
          {realisation.feedbackTargets.map((target) => (
            <div>
              <Typography
                variant="body1"
                component="p"
                className={classes.targetName}
              >
                {getLanguageValue(target.name, i18n.language)}
              </Typography>
              <Typography variant="body2" component="p">
                {`${t('feedbackTargets:feedbackOpen')}:
            ${format(parseISO(target.opensAt), 'd.M.yyyy')}
            -
            ${format(parseISO(target.closesAt), 'd.M.yyyy')}`}
              </Typography>
            </div>
          ))}
        </CardContent>
      </Card>
    </ListItem>
  )
}

export default FeedbackTargetList
