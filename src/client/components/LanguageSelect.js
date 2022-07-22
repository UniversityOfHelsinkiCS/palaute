import React from 'react'

import { Select, MenuItem, FormControl, InputLabel } from '@mui/material'

import { useTranslation } from 'react-i18next'

import useId from '../hooks/useId'

const style = {
  select: {
    maxWidth: '220px',
    minWidth: '170px',
  },
}

const LanguageSelect = ({ value, onChange, label }) => {
  const { t } = useTranslation()
  const id = useId()
  const labelId = `languageSelect-${id}`

  const handleChange = (event) => {
    onChange(event.target.value)
  }

  return (
    <FormControl variant="outlined">
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        sx={style.select}
        onChange={handleChange}
        value={value}
        label={label}
      >
        <MenuItem value="fi">{t('languages.fi')}</MenuItem>
        <MenuItem value="sv">{t('languages.sv')}</MenuItem>
        <MenuItem value="en">{t('languages.en')}</MenuItem>
      </Select>
    </FormControl>
  )
}

export default LanguageSelect
