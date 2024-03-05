import React from 'react'

import MarkdownPreviewBase from './MarkdownPreviewBase'
import TextField from '../common/TextField'

import { getLanguageValue } from '../../util/languageUtils'

const OpenPreview = ({ question, language }) => {
  const label = getLanguageValue(question.data?.label, language)
  const description = getLanguageValue(question.data?.description, language)
  const required = question.required ?? false

  return (
    <MarkdownPreviewBase label={label} description={description} required={required}>
      <TextField multiline fullWidth />
    </MarkdownPreviewBase>
  )
}

export default OpenPreview
