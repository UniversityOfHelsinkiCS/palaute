import type { FormEvent } from 'react'

import { Clear, Search } from '@mui/icons-material'
import { Box, IconButton, InputAdornment, TextField } from '@mui/material'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavigationType, useLocation, useNavigate, useNavigationType } from 'react-router-dom'

import { FROM_SEARCH_FIELD, isFromSearchField } from './search'

// The results follow the field as the reader types. The query is the one shown, empty when the results aren't.
const SearchField = ({ query }: { query: string }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { key, state } = useLocation()
  const navigationType = useNavigationType()
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(query)
  const [shownKey, setShownKey] = useState(key)

  // The field's own navigation can lag behind the typing, so only moving elsewhere sets it from the address
  if (key !== shownKey) {
    setShownKey(key)
    if (navigationType === NavigationType.Pop || !isFromSearchField(state)) setValue(query)
  }

  // Typing on a page moves to the results, so that Back returns to the page. The address is read from the window, as
  // the router's location can still be behind.
  const show = (next: string, keepFocus: boolean) => {
    void navigate(next.trim() ? `/guide?${new URLSearchParams({ q: next })}` : '/guide', {
      replace: new URLSearchParams(window.location.search).has('q'),
      state: keepFocus ? FROM_SEARCH_FIELD : undefined,
    })
  }

  const onChange = (next: string) => {
    setValue(next)
    show(next, true)
  }

  // Moves the focus to the results, past the menu
  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    show(value, false)
  }

  return (
    <Box component="form" role="search" onSubmit={onSubmit} sx={{ mb: 2 }}>
      <TextField
        inputRef={inputRef}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={t('userGuide:search')}
        size="small"
        fullWidth
        slotProps={{
          htmlInput: { 'aria-label': t('userGuide:search'), inputMode: 'search', enterKeyHint: 'search' },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: value && (
              <InputAdornment position="end">
                <IconButton
                  aria-label={t('userGuide:clearSearch')}
                  edge="end"
                  size="small"
                  onClick={() => {
                    onChange('')
                    inputRef.current?.focus()
                  }}
                >
                  <Clear fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    </Box>
  )
}

export default SearchField
