import React from 'react'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../../../../util/languageUtils'
import Markdown from '../../../../../components/common/Markdown'

const Text = ({ question }) => {
  const { i18n } = useTranslation()
  const content = getLanguageValue(question.data?.content, i18n.language) ?? ''

  return <Markdown>{content}</Markdown>
}

export default Text
