import React from 'react'
import { List, ListItem } from '@material-ui/core'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../util/languageUtils'
import ResultsContent from './ResultsContent'

const OpenResults = ({ question }) => {
  const { i18n } = useTranslation()

  const label = getLanguageValue(question.data?.label, i18n.language)

  const description = getLanguageValue(
    question.data?.description,
    i18n.language,
  )

  const feedbacks = question.feedbacks ?? []

  const filteredFeedbacks = feedbacks.filter(({ data }) => Boolean(data))

  return (
    <ResultsContent title={label} description={description}>
      <List>
        {filteredFeedbacks.map(({ data }, index) => (
          <ListItem
            primary={data}
            divider={index < filteredFeedbacks.length - 1}
            disableGutters
          />
        ))}
      </List>
    </ResultsContent>
  )
}

export default OpenResults
