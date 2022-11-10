import React from 'react'
import { Chip, Tooltip } from '@mui/material'
import { getLanguageValue } from '../../util/languageUtils'
import { generate } from '../../util/randomColor'

export const TagChip = ({ tag, language = 'fi', compact = false }) =>
  compact ? (
    <Tooltip key={tag.id} title={getLanguageValue(tag.name, language)}>
      <Chip
        label={getLanguageValue(tag.name, language)[0]}
        size="small"
        sx={{ background: generate(tag.id), margin: '1px' }}
      />
    </Tooltip>
  ) : (
    <Chip
      label={getLanguageValue(tag.name, language)}
      sx={{ background: generate(tag.id), margin: '1px' }}
    />
  )
