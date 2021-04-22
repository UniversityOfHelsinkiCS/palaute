import React from 'react'
import { useTranslation } from 'react-i18next'
import { Typography } from '@material-ui/core'

import { getLanguageValue } from '../../util/languageUtils'

const Text = ({ question }) => {
  const { i18n } = useTranslation()
  const content = getLanguageValue(question.data?.content, i18n.language) ?? ''

  return <Typography>{content}</Typography>
}

export default Text
