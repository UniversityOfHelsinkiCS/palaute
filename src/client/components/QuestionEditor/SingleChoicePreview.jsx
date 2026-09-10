import { RadioGroup, FormControlLabel, Radio } from '@mui/material'

import { optionFocusIndicatorStyle } from '../../util/accessibility'
import { getLanguageValue } from '../../util/languageUtils'
import PreviewBase from './PreviewBase'

const SingleChoicePreview = ({ question, language }) => {
  const label = getLanguageValue(question.data?.label, language)
  const description = getLanguageValue(question.data?.description, language)
  const options = question.data?.options ?? []
  const required = question.required ?? false

  return (
    <PreviewBase
      label={label}
      description={description}
      required={required}
      labelProps={{ component: 'legend', id: `question-${question.id}-legend` }}
      id={`question-${question.id}`}
    >
      <RadioGroup aria-labelledby={`question-${question.id}-legend`} sx={{ paddingLeft: '0.8rem' }}>
        {options.map(option => (
          <FormControlLabel
            value={option.id}
            control={<Radio color="primary" disableFocusRipple />}
            label={getLanguageValue(option.label, language)}
            key={option.id}
            sx={{ pr: 1, ...optionFocusIndicatorStyle() }}
          />
        ))}
      </RadioGroup>
    </PreviewBase>
  )
}

export default SingleChoicePreview
