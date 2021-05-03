import React from 'react'

import { Typography } from '@material-ui/core'
import { getLanguageValue } from '../../util/languageUtils'

const TextPreview = ({ question, language }) => {
  const content = getLanguageValue(question.data?.content, language)

  return <Typography>{content}</Typography>
}

export default TextPreview
