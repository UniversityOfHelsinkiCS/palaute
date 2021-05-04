import React from 'react'

import { getLanguageValue } from '../../util/languageUtils'
import PreviewBase from './PreviewBase'
import TextField from '../TextField'

const OpenPreview = ({ question, language }) => {
  const label = getLanguageValue(question.data?.label, language)
  const description = getLanguageValue(question.data?.description, language)

  return (
    <PreviewBase label={label} description={description}>
      <TextField multiline fullWidth />
    </PreviewBase>
  )
}

export default OpenPreview
