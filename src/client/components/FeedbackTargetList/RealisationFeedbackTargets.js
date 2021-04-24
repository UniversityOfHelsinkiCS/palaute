import React from 'react'
import { useTranslation } from 'react-i18next'

import {
  Card,
  CardContent,
  Typography,
  ListItem,
  makeStyles,
} from '@material-ui/core'

import FeedbackTarget from './FeedbackTarget'
import { getLanguageValue } from '../../util/languageUtils'
import { parseDate } from './util'

const useStyles = makeStyles(() => ({
  listItem: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  card: {
    minWidth: 600,
  },
}))

const RealisationFeedbackTargets = ({ realisation }) => {
  const { i18n } = useTranslation()

  const classes = useStyles()

  return (
    <ListItem className={classes.listItem} disableGutters>
      <Card className={classes.card} variant="outlined">
        <CardContent>
          <Typography variant="h6" component="h4">
            {getLanguageValue(realisation.name, i18n.language)}
          </Typography>
          <Typography variant="body2" component="p">
            {`${parseDate(realisation.startDate)} - 
              ${parseDate(realisation.endDate)}`}
          </Typography>
          {realisation.feedbackTargets.map((target) => (
            <FeedbackTarget key={target.id} target={target} />
          ))}
        </CardContent>
      </Card>
    </ListItem>
  )
}

export default RealisationFeedbackTargets
