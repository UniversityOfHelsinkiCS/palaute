import React from 'react'
import { List, ListItem, ListItemText } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../util/languageUtils'
import ResultsContent from './ResultsContent'

const useStyles = makeStyles({
  list: {
    maxHeight: '800px',
    overflowY: 'scroll',
    '&::-webkit-scrollbar': {
      width: 10,
    },
    '&::-webkit-scrollbar-track': {
      boxShadow: 'inset 0 0 5px grey',
      borderRadius: 10,
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#107eab',
      borderRadius: 10,
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: '#0e6e95',
    },
    '@media print': {
      overflow: 'visible',
      maxHeight: '100%',
      height: 'auto',
    },
  },
})

const OpenResults = ({ question }) => {
  const { i18n } = useTranslation()
  const classes = useStyles()

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
            key={index}
          >
            <ListItemText primary={feedback.data} />
          </ListItem>
        ))}
      </List>
    </ResultsContent>
  )
}

export default OpenResults
