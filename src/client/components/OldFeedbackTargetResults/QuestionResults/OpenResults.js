import React from 'react'
import { List, ListItem, ListItemText } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../../util/languageUtils'
import ResultsContent from './ResultsContent'

const styles = {
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
}

const OpenResults = ({ question }) => {
  const { i18n } = useTranslation()

  const label = getLanguageValue(question.data?.label, i18n.language)

  const description = getLanguageValue(question.data?.description, i18n.language)

  const feedbacks = question.feedbacks ?? []

  const filteredFeedbacks = feedbacks.filter(({ data }) => Boolean(data))

  return (
    <ResultsContent title={label} description={description}>
      <List sx={styles.list}>
        {filteredFeedbacks.map((feedback, index) => (
          <ListItem divider={index < filteredFeedbacks.length - 1} disableGutters key={index}>
            <ListItemText primary={feedback.data} primaryTypographyProps={{ whiteSpace: 'pre-line' }} />
          </ListItem>
        ))}
      </List>
    </ResultsContent>
  )
}

export default OpenResults
