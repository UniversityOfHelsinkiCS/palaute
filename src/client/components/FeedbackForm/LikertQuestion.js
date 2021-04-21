import React from 'react'

import {
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
  makeStyles,
  FormHelperText,
} from '@material-ui/core'

import { useField } from 'formik'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../util/languageUtils'

const useStyles = makeStyles((theme) => ({
  label: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
}))

const options = [...Array(5)].map((v, i) => i + 1)

const LikertQuestion = ({ question, name }) => {
  const classes = useStyles()
  const [{ value: answer }, meta, helpers] = useField(name)
  const { t, i18n } = useTranslation()
  const label = getLanguageValue(question.data?.label, i18n.language) ?? ''

  const showError = meta.error && meta.touched

  const value = answer ?? ''

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
          row
        >
          {options.map((option) => (
            <FormControlLabel
              labelPlacement="top"
              value={option.toString()}
              control={<Radio color="primary" />}
              label={option.toString()}
              key={option}
              className={classes.label}
            />
          ))}
        </RadioGroup>
      </FormControl>
      {showError && <FormHelperText error>{t(meta.error)}</FormHelperText>}
    </>
  )
}

export default LikertQuestion
