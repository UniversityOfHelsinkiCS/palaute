import React, { useMemo } from 'react'
import { useParams, useHistory } from 'react-router'
import { useTranslation } from 'react-i18next'

import { format, parseISO } from 'date-fns'

import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  makeStyles,
  Button,
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
  card: {
    minWidth: 600,
  },
  target: {
    paddingTop: 10,
  },
  button: {
    padding: 2,
    marginTop: 5,
    marginBottom: 5,
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
  const history = useHistory()

  const classes = useStyles()

  const handleClick = (e, id) => {
    e.preventDefault()

    history.push(`/targets/${id}/edit`)
  }

  return (
    <ListItem className={classes.listItem} disableGutters>
      <Card className={classes.card} variant="outlined">
        <CardContent>
          <Typography variant="h6" component="h4">
            {getLanguageValue(realisation.name, i18n.language)}
          </Typography>
          {realisation.feedbackTargets.map((target) => (
            <div className={classes.target}>
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
              <Button
                onClick={(e) => handleClick(e, target.id)}
                className={classes.button}
                variant="contained"
                color="primary"
              >
                Edit
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </ListItem>
  )
}

export default FeedbackTargetList
