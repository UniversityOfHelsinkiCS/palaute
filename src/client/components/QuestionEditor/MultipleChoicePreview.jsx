import React from 'react'
import { FormGroup, FormControlLabel, Checkbox } from '@mui/material'

import { getLanguageValue } from '../../util/languageUtils'
import PreviewBase from './PreviewBase'
import { optionFocusIndicatorStyle } from '../../util/accessibility'

const MultipleChoicePreview = ({ question, language }) => {
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
            control={<Checkbox color="primary" name={option.id} disableFocusRipple />}
            label={getLanguageValue(option.label, language)}
            key={option.id}
            sx={{ pr: 1, ...optionFocusIndicatorStyle() }}
          />
        ))}
      </FormGroup>
    </PreviewBase>
  )
}

export default MultipleChoicePreview
