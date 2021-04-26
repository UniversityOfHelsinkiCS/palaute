import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import {
  ListItemText,
  ListItem,
  Box,
  makeStyles,
  Button,
} from '@material-ui/core'

import { getLanguageValue } from '../../util/languageUtils'
import { formatDate } from './utils'

const useStyles = makeStyles((theme) => ({
  listItem: {},
  action: {
    '&:not(last-child)': {
      marginRight: theme.spacing(1),
    },
  },
}))

const FeedbackTargetItem = ({ feedbackTarget, divider }) => {
  const classes = useStyles()
  const { i18n, t } = useTranslation()

  const { id, closesAt, opensAt, name } = feedbackTarget

  const periodInfo = t('feedbackOpenPeriod', {
    opensAt: formatDate(opensAt),
    closesAt: formatDate(closesAt),
  })

  const translatedName = getLanguageValue(name, i18n.language)

  return (
    <ListItem className={classes.listItem} divider={divider} disableGutters>
      <ListItemText primary={translatedName} secondary={periodInfo} />
      <Box pl={2} display="flex">
        <Button
          component={Link}
          className={classes.action}
          variant="contained"
          color="primary"
          to={`/targets/${id}/edit`}
        >
          {t('edit')}
        </Button>
        <Button
          component={Link}
          className={classes.action}
          color="primary"
          to={`/targets/${id}/results`}
        >
          Results
        </Button>
      </Box>
    </ListItem>
  )
}

export default FeedbackTargetItem
