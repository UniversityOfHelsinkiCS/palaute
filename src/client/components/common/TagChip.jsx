import React from 'react'
import { Chip, Tooltip } from '@mui/material'
import { getLanguageValue } from '../../util/languageUtils'
import { generate } from '../../util/randomColor'

export const TagChip = ({ tag, language = 'fi', compact = false, prefix = '' }) => {
  const color = generate(tag.hash)

  const style = {
    backgroundColor: color,
    margin: '1px',
  }

  return compact ? (
    <Tooltip key={tag.id} title={`${prefix}${getLanguageValue(tag.name, language)}`} arrow>
      <Chip label={getLanguageValue(tag.name, language)[0]} size="small" sx={style} />
    </Tooltip>
  ) : (
    <Chip label={`${prefix}${getLanguageValue(tag.name, language)}`} sx={style} />
  )
}
