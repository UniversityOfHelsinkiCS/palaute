import type { SelectChangeEvent } from '@mui/material'
import type { ReactNode } from 'react'

import { Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

import useId from '../../hooks/useId'
import { LANGUAGES } from '../../util/common'

const style = {
  select: {
    maxWidth: '220px',
    minWidth: '170px',
  },
}

type LanguageSelectProps = {
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
