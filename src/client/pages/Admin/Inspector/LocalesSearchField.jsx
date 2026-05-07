import React from 'react'

import { Box, Select, MenuItem, TextField } from '@mui/material'

const LocalesSearchField = ({ label, handleChange, query, setQuery, queryKey = 'name', clearKeys = ['id'] }) => {
  const handleFocus = () => {
    if (!clearKeys?.length) return
    const nextQuery = { ...query }
    clearKeys.forEach(key => {
      nextQuery[key] = ''
    })
    setQuery(nextQuery)
  }

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <TextField
        fullWidth
        label={label}
        value={query[queryKey] ?? ''}
        onFocus={handleFocus}
        onChange={e => handleChange({ ...query, [queryKey]: e.target.value })}
        slotProps={{
          input: {
            sx: { paddingRight: '64px' },
          },
        }}
      />
      <Select
        variant="standard"
        disableUnderline
        value={query.language}
        onChange={e => handleChange({ ...query, language: e.target.value })}
        sx={{
          position: 'absolute',
          right: '8px',
          top: '12px',
          paddingLeft: '8px',
          borderLeft: '2px solid rgba(0, 0, 0, 0.23)',
        }}
      >
        <MenuItem value="fi">FI</MenuItem>
        <MenuItem value="en">EN</MenuItem>
      </Select>
    </Box>
  )
}

export default LocalesSearchField
