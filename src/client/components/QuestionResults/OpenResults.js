import React from 'react'
import { List, ListItem, ListItemText, makeStyles } from '@material-ui/core'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../util/languageUtils'
import ResultsContent from './ResultsContent'

const useStyles = makeStyles({
  list: {
    maxHeight: '800px',
    overflowY: 'scroll',
  },
})

const OpenResults = ({ question }) => {
  const { i18n } = useTranslation()
  const { classes } = useStyles()

  const label = getLanguageValue(question.data?.label, i18n.language)

  const description = getLanguageValue(
    question.data?.description,
    i18n.language,
  )

  const feedbacks = question.feedbacks ?? []

  const filteredFeedbacks = feedbacks.filter(({ data }) => Boolean(data))

  return (
    <ResultsContent title={label} description={description}>
      <List className={classes.list}>
        {filteredFeedbacks.map((feedback, index) => (
          <ListItem
            divider={index < filteredFeedbacks.length - 1}
            disableGutters
          >
            <ListItemText primary={feedback.data} />
          </ListItem>
        ))}
      </List>
    </ResultsContent>
  )
}

export default OpenResults
