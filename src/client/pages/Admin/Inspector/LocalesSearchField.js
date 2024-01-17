import React from 'react'

import { Box, Select, MenuItem, TextField } from '@mui/material'

const LocalesSearchField = ({ label, handleChange, query, setQuery, runQuery }) => (
  <Box sx={{ width: '100%', position: 'relative' }}>
    <TextField
      fullWidth
      label={label}
      value={query.name}
      onFocus={() => setQuery({ ...query, id: '' })}
      onChange={e => handleChange({ ...query, name: e.target.value })}
      InputProps={{ sx: { pr: '64px' } }}
    />
    <Select
      variant="standard"
      disableUnderline
      value={query.language}
      onChange={event => {
        const newQuery = {
          ...query,
          language: event.target.value,
        }
        setQuery(newQuery)
        if (query.name?.length > 2) {
          runQuery(newQuery)
        }
      }}
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

export default LocalesSearchField
