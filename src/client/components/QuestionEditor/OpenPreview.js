import React from 'react'

import { getLanguageValue } from '../../util/languageUtils'
import PreviewBase from './PreviewBase'
import TextField from '../TextField'

const OpenPreview = ({ question, language }) => {
  const label = getLanguageValue(question.data?.label, language)

  return (
    <PreviewBase label={label}>
      <TextField multiline fullWidth />
    </PreviewBase>
  )
}

export default OpenPreview
