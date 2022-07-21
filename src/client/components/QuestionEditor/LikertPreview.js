import React from 'react'

import { RadioGroup, FormControlLabel, Radio } from '@mui/material'

import { getLanguageValue } from '../../util/languageUtils'
import PreviewBase from './PreviewBase'

const styles = {
  optionLabel: {
    marginLeft: (theme) => theme.spacing(0.5),
    marginRight: (theme) => theme.spacing(0.5),
  },
  dontKnowLabel: {
    marginLeft: (theme) => theme.spacing(2),
    marginRight: (theme) => theme.spacing(0.5),
  },
}

const options = [1, 2, 3, 4, 5, 0]

const LikertPreview = ({ question, language }) => {
  const label = getLanguageValue(question.data?.label, language)
  const description = getLanguageValue(question.data?.description, language)
  const required = question.required ?? false

  const parseOption = (option) => {
    if (option !== 0) return option.toString()

    if (language === 'fi') return 'eos'
    return 'N/A'
  }

  return (
    <PreviewBase label={label} description={description} required={required}>
      <RadioGroup row>
        {options.map((option) => (
          <FormControlLabel
            labelPlacement="top"
            value={option.toString()}
            control={<Radio color="primary" />}
            label={parseOption(option)}
            key={option}
            sx={option !== 0 ? styles.optionLabel : styles.dontKnowLabel}
          />
        ))}
      </RadioGroup>
    </PreviewBase>
  )
}

export default LikertPreview
