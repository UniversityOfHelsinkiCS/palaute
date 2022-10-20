import React from 'react'
import {
  Box,
  Checkbox,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from '@mui/material'
import { Close } from '@mui/icons-material'

/**
 * options must be an array of objects with id and label
 *
 *
 */
const MultiSelect = ({ value, onChange, options, label }) => {
  const selectedOptions = value.map((v) => options.find((o) => o.id === v))

  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        onClick={(event) => event.stopPropagation()}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        label={label}
        renderValue={() => (
          <RenderValue selected={selectedOptions} onChange={onChange} />
        )}
        sx={{ zIndex: 0 }}
        // eslint-disable-next-line react/no-unstable-nested-components
        IconComponent={() => <div />}
        endAdornment={
          <IconButton onClick={() => onChange([])} size="small">
            <Close />
          </IconButton>
        }
        MenuProps={{
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            <Checkbox checked={value.includes(option.id)} />
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

const RenderValue = ({ selected }) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.3 }}>
    {selected.map((value) => (
      <Chip key={value.id} label={value.label} />
    ))}
  </Box>
)

export default MultiSelect
