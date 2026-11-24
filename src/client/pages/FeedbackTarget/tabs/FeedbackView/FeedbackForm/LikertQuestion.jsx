import { FormControl, RadioGroup, FormControlLabel, Radio, FormHelperText } from '@mui/material'
import { useField } from 'formik'
import { useTranslation } from 'react-i18next'

import { optionFocusIndicatorStyle } from '../../../../../util/accessibility'
import { getLanguageValue } from '../../../../../util/languageUtils'
import { useQuestionLanguage } from '../../../../../util/questionLanguageContext'
import QuestionBase from './QuestionBase'
import { getDontKnowOption, useDelayedTouched } from './utils'

const options = [1, 2, 3, 4, 5, 0]

const RADIO_ICON = 24
const OPTION_MARGIN = 1.6
const DONT_KNOW_MARGINS = [8, 4]
const MARGINS = (options.length - 1) * 2 * OPTION_MARGIN + DONT_KNOW_MARGINS[0] + DONT_KNOW_MARGINS[1]
// Shrinks on narrow screens before the options wrap, 100cqw being the width of the row. A few pixels spare for rounding.
const RADIO_PADDING = `clamp(2px, (100cqw - ${options.length * RADIO_ICON + MARGINS + 4}px) / ${2 * options.length}, 9px)`

const styles = {
  optionLabel: { mx: `${OPTION_MARGIN}px` },
  dontKnowLabel: { ml: `${DONT_KNOW_MARGINS[0]}px`, mr: `${DONT_KNOW_MARGINS[1]}px` },
}

const LikertQuestion = ({ question, name, disabled }) => {
  const [{ value: answer }, meta, helpers] = useField(name)
  const { t } = useTranslation()
  const language = useQuestionLanguage()

  const { handleGroupBlur, handleGroupFocus } = useDelayedTouched(helpers.setTouched, answer)

  const label = getLanguageValue(question.data?.label, language) ?? ''

  const description = getLanguageValue(question.data?.description, language) ?? ''

  const showError = meta.error && meta.touched
  const { required } = question
  const value = answer ?? ''

  const parseOption = option => {
    if (option !== 0) return option.toString()

    return getDontKnowOption(question.data.label, language)
  }

  const errorId = `${name.replace(/\./g, '-')}-error`
  const descriptionId = description ? `question-${question.id}-description` : undefined

  const ariaDescribedBy = [showError ? errorId : undefined, description ? descriptionId : undefined].filter(Boolean)

  return (
    <FormControl
      component="fieldset"
      fullWidth
      aria-describedby={ariaDescribedBy.length > 0 ? ariaDescribedBy.join(' ') : undefined}
      onBlur={handleGroupBlur}
      onFocus={handleGroupFocus}
    >
      <QuestionBase
        label={label}
        required={required}
        description={description}
        labelProps={{ component: 'legend', id: `question-${question.id}-legend` }}
        id={`question-${question.id}`}
      >
        <RadioGroup
          aria-labelledby={`question-${question.id}-legend`}
          value={value}
          onChange={event => {
            helpers.setValue(event.target.value)
          }}
          row
          sx={{ containerType: 'inline-size' }}
        >
          {options.map(option => (
            <FormControlLabel
              labelPlacement="top"
              value={option.toString()}
              control={<Radio color="primary" disableFocusRipple sx={{ p: RADIO_PADDING }} />}
              label={parseOption(option)}
              key={option}
              sx={{
                ...(option !== 0 ? styles.optionLabel : styles.dontKnowLabel),
                ...optionFocusIndicatorStyle(),
              }}
              disabled={disabled}
            />
          ))}
        </RadioGroup>
        {showError && (
          <FormHelperText error id={errorId} role="alert" sx={{ ml: 2 }}>
            {t(meta.error)}
          </FormHelperText>
        )}
      </QuestionBase>
    </FormControl>
  )
}

export default LikertQuestion
