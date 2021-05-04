import React from 'react'

import {
  RadioGroup,
  FormControlLabel,
  Radio,
  makeStyles,
} from '@material-ui/core'

import { getLanguageValue } from '../../util/languageUtils'
import PreviewBase from './PreviewBase'

const useStyles = makeStyles((theme) => ({
  optionLabel: {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },
}))

const options = [...Array(6)].map((v, i) => i)

const LikertPreview = ({ question, language }) => {
  const classes = useStyles()
  const label = getLanguageValue(question.data?.label, language)
  const description = getLanguageValue(question.data?.description, language)
  const required = question.required ?? false

  return (
    <PreviewBase label={label} description={description} required={required}>
      <RadioGroup row>
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
    </PreviewBase>
  )
}

export default LikertPreview
