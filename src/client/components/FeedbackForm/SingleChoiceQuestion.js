import React from 'react'

import {
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
} from '@material-ui/core'

import { useField } from 'formik'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../util/languageUtils'

const SingleChoiceQuestion = ({ name }) => {
  const [{ value: question }] = useField(name)
  const [{ value: answer }, , helpers] = useField(`${name}.answer`)
  const { i18n } = useTranslation()
  const label = getLanguageValue(question.data?.label, i18n.language) ?? ''

  const value = answer ?? ''
  const options = question.data?.options ?? []

  return (
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
          helpers.setTouched()
        }}
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
  )
}

export default SingleChoiceQuestion
