import React from 'react'
import { FormControlLabel, FormGroup, Checkbox } from '@mui/material'

import { getLanguageValue } from '../../util/languageUtils'
import PreviewBase from './PreviewBase'

const GroupingPreview = ({ question, language }) => {
  const label = getLanguageValue(question.data?.label, language)
  const description = getLanguageValue(question.data?.description, language)
  const options = question.data?.options ?? []
  const required = question.required ?? false

  return (
    <PreviewBase label={label} description={description} required={required}>
      <FormGroup>
        {options.map(option => (
          <FormControlLabel
            value={option.id}
            control={<Checkbox color="primary" name={option.id} />}
            label={getLanguageValue(option.label, language)}
            key={option.id}
          />
        ))}
      </FormGroup>
    </PreviewBase>
  )
}

export default GroupingPreview
