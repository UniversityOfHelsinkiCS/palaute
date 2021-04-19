import React from 'react'
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

  return (
    <div>
      <Typography variant="h4" component="h3">
        {t('feedbackTargets:title')}
      </Typography>
      <List>
        {feedbackTargets &&
          feedbackTargets.map((target) => (
            <FeedbackTarget key={target.id} feedbackTarget={target} />
          ))}
      </List>
    </div>
  )
}

const FeedbackTarget = ({ feedbackTarget }) => {
  const { i18n, t } = useTranslation()

  const classes = useStyles()

  return (
    <ListItem className={classes.listItem} disableGutters>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" component="h4">
            {getLanguageValue(feedbackTarget.courseUnit.name, i18n.language)}
          </Typography>
          <Typography
            variant="body1"
            component="p"
            className={classes.targetName}
          >
            {getLanguageValue(feedbackTarget.name, i18n.language)}
          </Typography>
          <Typography variant="body2" component="p">
            {`${t('feedbackTargets:feedbackOpen')}:
            ${format(parseISO(feedbackTarget.opensAt), 'd.M.yyyy')}
            -
            ${format(parseISO(feedbackTarget.closesAt), 'd.M.yyyy')}`}
          </Typography>
        </CardContent>
      </Card>
    </ListItem>
  )
}

export default FeedbackTargetList
