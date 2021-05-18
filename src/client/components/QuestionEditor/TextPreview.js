import React from 'react'

import { getLanguageValue } from '../../util/languageUtils'
import Markdown from '../Markdown'

const TextPreview = ({ question, language }) => {
  const content = getLanguageValue(question.data?.content, language)

  return <Markdown>{content}</Markdown>
}

export default TextPreview
