import React from 'react'
import { RadioGroup, FormControlLabel, Radio } from '@material-ui/core'

import { getLanguageValue } from '../../util/languageUtils'
import PreviewBase from './PreviewBase'

const SingleChoicePreview = ({ question, language }) => {
  const label = getLanguageValue(question.data?.label, language)

  const options = question.data?.options ?? []

  return (
    <PreviewBase label={label}>
      <RadioGroup>
        {options.map((option) => (
          <FormControlLabel
            value={option.id}
            control={<Radio color="primary" />}
            label={getLanguageValue(option.label, language)}
            key={option.id}
          />
        ))}
      </RadioGroup>
    </PreviewBase>
  )
}

export default SingleChoicePreview
