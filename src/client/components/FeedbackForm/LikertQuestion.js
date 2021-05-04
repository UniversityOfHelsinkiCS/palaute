import React from 'react'

import {
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  makeStyles,
  FormHelperText,
} from '@material-ui/core'

import { useField } from 'formik'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../util/languageUtils'

const useStyles = makeStyles((theme) => ({
  optionLabel: {
    marginLeft: theme.spacing(0.2),
    marginRight: theme.spacing(0.2),
  },
  dontKnowLabel: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(0.5),
  },
  label: {
    marginBottom: theme.spacing(1),
  },
  description: {
    marginBottom: theme.spacing(1),
  },
}))

const options = [1, 2, 3, 4, 5, 0]

const LikertQuestion = ({ question, name }) => {
  const classes = useStyles()
  const [{ value: answer }, meta, helpers] = useField(name)
  const { t, i18n } = useTranslation()
  const label = getLanguageValue(question.data?.label, i18n.language) ?? ''

  const description =
    getLanguageValue(question.data?.description, i18n.language) ?? ''

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
        <Typography variant="h6" className={classes.label} component="legend">
          {label}
          {required && ' *'}
        </Typography>
        {description && (
          <Typography className={classes.description}>{description}</Typography>
        )}
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
      </FormControl>
      {showError && <FormHelperText error>{t(meta.error)}</FormHelperText>}
    </>
  )
}

export default LikertQuestion
