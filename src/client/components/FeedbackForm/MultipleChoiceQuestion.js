import React from 'react'

import {
  FormControl,
  FormGroup,
  FormControlLabel,
  Typography,
  Box,
  Checkbox,
} from '@material-ui/core'

import { useField } from 'formik'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../util/languageUtils'

const MultipleChoiceQuestion = ({ name }) => {
  const [{ value: question }] = useField(name)
  const [{ value: answer }, , helpers] = useField(`${name}.answer`)
  const { i18n } = useTranslation()
  const label = getLanguageValue(question.data?.label, i18n.language) ?? ''

  const value = answer ?? []
  const options = question.data?.options ?? []

  const handleChange = (event) => {
    const { name, checked } = event.target

    const newValue = checked
      ? [...value, name]
      : value.filter((n) => n !== name)

    helpers.setValue(newValue)
    helpers.setTouched()
  }

  return (
    <FormControl component="fieldset">
      <Box mb={1}>
        <Typography variant="h6" component="legend">
          {label}
        </Typography>
      </Box>
      <FormGroup>
        {options.map((option) => (
          <FormControlLabel
            value={option.id}
            control={
              <Checkbox
                checked={value.includes(option.id)}
                onChange={handleChange}
                color="primary"
                name={option.id}
              />
            }
            label={getLanguageValue(option.label, i18n.language)}
            key={option.id}
          />
        ))}
      </FormGroup>
    </FormControl>
  )
}

export default MultipleChoiceQuestion
