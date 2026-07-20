import React from 'react'
import { Box, Checkbox, Chip, FormControl, IconButton, InputLabel, ListItemText, MenuItem, Select } from '@mui/material'
import { Close } from '@mui/icons-material'
import { generate } from '../../util/randomColor'

type MultiSelectOption = {
  id: number
  label: string
  hash?: number
}

type MultiSelectProps = {
  value: number[]
  onChange: (value: number[]) => void
  options: MultiSelectOption[]
  label: string
  colors?: boolean
  disabled?: boolean
}

const Option = ({ option, colors }: { option: MultiSelectOption; colors?: boolean }) => (
  <Chip label={option.label} sx={colors ? { background: generate(option.hash ?? option.id) } : undefined} />
)

const RenderValue = ({ selected, colors }: { selected: MultiSelectOption[]; colors?: boolean }) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.3 }}>
    {selected.map(value => (
      <Option key={value.id} option={value} colors={colors} />
    ))}
  </Box>
)

const MultiSelect = ({ value, onChange, options, label, colors, disabled }: MultiSelectProps) => {
  const selectedOptions = value.map(v => options.find(o => o.id === v)).filter((o): o is MultiSelectOption => !!o)
  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select<number[]>
        multiple
        disabled={disabled}
        onClick={event => event.stopPropagation()}
        value={value}
        onChange={event => {
          const { value: newValue } = event.target
          onChange(typeof newValue === 'string' ? newValue.split(',').map(Number) : newValue)
        }}
        label={label}
        renderValue={() => <RenderValue selected={selectedOptions} colors={colors} />}
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
        {options.map(option => (
          <MenuItem key={option.id} value={option.id}>
            <Checkbox checked={value.includes(option.id)} />
            <ListItemText primary={<Option option={option} colors={colors} />} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default MultiSelect
