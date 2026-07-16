import React from 'react'
import type { ReactNode } from 'react'

import { Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'

import { useTranslation } from 'react-i18next'

import { LANGUAGES } from '../../util/common'

import useId from '../../hooks/useId'

const style = {
  select: {
    maxWidth: '220px',
    minWidth: '170px',
  },
}

interface LanguageSelectProps {
  value: string
  onChange: (value: string) => void
  label: ReactNode
}

const LanguageSelect = ({ value, onChange, label }: LanguageSelectProps) => {
  const { t } = useTranslation()
  const id = useId()
  const labelId = `languageSelect-${id}`

  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value)
  }

  return (
    <FormControl variant="outlined">
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select labelId={labelId} sx={style.select} onChange={handleChange} value={value} label={label}>
        {LANGUAGES.map(language => (
          <MenuItem key={language} value={language}>
            {t(`common:languages:${language}`)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default LanguageSelect
