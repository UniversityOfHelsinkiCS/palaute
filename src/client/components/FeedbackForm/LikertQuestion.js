import React from 'react'

import {
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  makeStyles,
  FormHelperText,
} from '@material-ui/core'

import { useField } from 'formik'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../util/languageUtils'
import useLanguage from '../../hooks/useLanguage'
import QuestionBase from './QuestionBase'

const useStyles = makeStyles((theme) => ({
  optionLabel: {
    marginLeft: theme.spacing(0.2),
    marginRight: theme.spacing(0.2),
  },
  dontKnowLabel: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(0.5),
  },
}))

const options = [1, 2, 3, 4, 5, 0]

const LikertQuestion = ({ question, name }) => {
  const classes = useStyles()
  const [{ value: answer }, meta, helpers] = useField(name)
  const { i18n } = useTranslation()
  const language = useLanguage()

  const t = i18n.getFixedT(language)

  const label = getLanguageValue(question.data?.label, language) ?? ''

  const description =
    getLanguageValue(question.data?.description, language) ?? ''

  const showError = meta.error && meta.touched
  const { required } = question
  const value = answer ?? ''

  const parseOption = (option) => {
    if (option !== 0) return option.toString()

    return t('feedbackView:dontKnowOption')
  }

  return (
    <>
      <FormControl component="fieldset">
        <QuestionBase
          label={label}
          required={required}
          description={description}
          labelProps={{ component: 'legend' }}
        >
          <RadioGroup
            aria-label={label}
            value={value}
            onChange={(event) => {
              helpers.setValue(event.target.value)
            }}
            onBlur={() => helpers.setTouched(true)}
            row
          >
            {options.map((option) => (
              <FormControlLabel
                labelPlacement="top"
                value={option.toString()}
                control={<Radio color="primary" />}
                label={parseOption(option)}
                key={option}
                className={
                  option !== 0 ? classes.optionLabel : classes.dontKnowLabel
                }
              />
            ))}
          </RadioGroup>
        </QuestionBase>
      </FormControl>
      {showError && <FormHelperText error>{t(meta.error)}</FormHelperText>}
    </>
  )
}

export default LikertQuestion
