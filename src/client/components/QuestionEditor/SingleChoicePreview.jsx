import React from 'react'
import { RadioGroup, FormControlLabel, Radio } from '@mui/material'

import { getLanguageValue } from '../../util/languageUtils'
import { radioFocusIndicatorStyle } from '../../util/accessibility'
import PreviewBase from './PreviewBase'

const SingleChoicePreview = ({ question, language }) => {
  const label = getLanguageValue(question.data?.label, language)
  const description = getLanguageValue(question.data?.description, language)
  const options = question.data?.options ?? []
  const required = question.required ?? false

  return (
    <PreviewBase label={label} description={description} required={required}>
      <RadioGroup>
        {options.map(option => (
          <FormControlLabel
            value={option.id}
            control={<Radio color="primary" disableFocusRipple />}
            label={getLanguageValue(option.label, language)}
            key={option.id}
            sx={{ pr: 1, ...radioFocusIndicatorStyle() }}
          />
        ))}
      </RadioGroup>
    </PreviewBase>
  )
}

export default SingleChoicePreview
