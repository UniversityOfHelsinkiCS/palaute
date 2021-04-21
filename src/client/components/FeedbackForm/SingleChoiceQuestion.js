import React from 'react'

import {
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
  FormHelperText,
} from '@material-ui/core'

import { useField } from 'formik'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../util/languageUtils'

const SingleChoiceQuestion = ({ question, name }) => {
  const [{ value: answer }, meta, helpers] = useField(name)
  const { t, i18n } = useTranslation()
  const label = getLanguageValue(question.data?.label, i18n.language) ?? ''

  const value = answer ?? ''
  const options = question.data?.options ?? []
  const showError = meta.error && meta.touched

  return (
    <>
      <FormControl component="fieldset">
        <Box mb={1}>
          <Typography variant="h6" component="legend">
            {label}
          </Typography>
        </Box>
        <RadioGroup
          aria-label={label}
          value={value}
          onChange={(event) => {
            helpers.setValue(event.target.value)
          }}
          onBlur={() => helpers.setTouched(true)}
        >
          {options.map((option) => (
            <FormControlLabel
              value={option.id}
              control={<Radio color="primary" />}
              label={getLanguageValue(option.label, i18n.language)}
              key={option.id}
            />
          ))}
        </RadioGroup>
      </FormControl>
      {showError && <FormHelperText error>{t(meta.error)}</FormHelperText>}
    </>
  )
}

export default SingleChoiceQuestion
