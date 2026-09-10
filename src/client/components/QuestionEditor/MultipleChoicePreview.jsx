import { FormGroup, FormControlLabel, Checkbox } from '@mui/material'

import { optionFocusIndicatorStyle } from '../../util/accessibility'
import { getLanguageValue } from '../../util/languageUtils'
import PreviewBase from './PreviewBase'

const MultipleChoicePreview = ({ question, language }) => {
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
      <FormGroup role="group" aria-labelledby={`question-${question.id}-legend`}>
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
