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
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },
  label: {
    marginBottom: theme.spacing(1),
  },
  description: {
    marginBottom: theme.spacing(1),
  },
}))

const options = [...Array(6)].map((v, i) => i)

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

  return (
    <>
      <FormControl component="fieldset">
        <Typography variant="h6" className={classes.label} component="legend">
          {label}
          {required && ' *'}
        </Typography>
        {description && (
          <Typography
            color="textSecondary"
            variant="body2"
            className={classes.description}
          >
            {description}
          </Typography>
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
              label={option.toString()}
              key={option}
              className={classes.optionLabel}
            />
          ))}
        </RadioGroup>
      </FormControl>
      {showError && <FormHelperText error>{t(meta.error)}</FormHelperText>}
    </>
  )
}

export default LikertQuestion
