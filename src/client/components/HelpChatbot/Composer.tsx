import type { KeyboardEvent, RefObject } from 'react'

import { ArrowUpward } from '@mui/icons-material'
import { Box, IconButton, InputAdornment, OutlinedInput } from '@mui/material'
import { visuallyHidden } from '@mui/utils'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { focusIndicatorStyle } from '../../util/accessibility'
import { mergeSx } from '../../util/sx'

export const MAX_QUESTION_LENGTH = 500
const COUNTER_FROM_LENGTH = 400

type ComposerProps = {
  inputRef: RefObject<HTMLTextAreaElement | null>
  draft: string
  canSend: boolean
  onDraftChange: (draft: string) => void
  onSend: () => void
}

const Composer = ({ inputRef, draft, canSend, onDraftChange, onSend }: ComposerProps) => {
  const { t } = useTranslation()
  const inputId = useId()
  const hintId = useId()
  const counterId = useId()

  const showCounter = draft.length >= COUNTER_FROM_LENGTH

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
    event.preventDefault()
    if (canSend) onSend()
  }

  // Sending disables the button, so focus would otherwise be left on a disabled element
  const handleSendClick = () => {
    onSend()
    inputRef.current?.focus()
  }

  return (
    <Box sx={{ flex: 'none', p: '10px 12px', borderTop: '1px solid', borderColor: 'divider' }}>
      <Box component="label" htmlFor={inputId} sx={visuallyHidden}>
        {t('helpChatbot:inputLabel')}
      </Box>
      <OutlinedInput
        id={inputId}
        inputRef={inputRef}
        multiline
        maxRows={5}
        fullWidth
        value={draft}
        onChange={event => onDraftChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('helpChatbot:inputPlaceholder')}
        inputProps={{
          maxLength: MAX_QUESTION_LENGTH,
          'aria-describedby': showCounter ? `${hintId} ${counterId}` : hintId,
        }}
        endAdornment={
          <InputAdornment position="end" sx={{ height: 'auto', maxHeight: 'none', alignSelf: 'flex-end' }}>
            <IconButton
              aria-label={t('helpChatbot:send')}
              disabled={!canSend}
              onClick={handleSendClick}
              disableFocusRipple
              sx={mergeSx(
                {
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.dark' },
                  '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' },
                },
                focusIndicatorStyle()
              )}
            >
              <ArrowUpward fontSize="small" />
            </IconButton>
          </InputAdornment>
        }
        sx={{
          alignItems: 'flex-end',
          p: '5px 5px 5px 12px',
          borderRadius: '12px',
          fontSize: 'inherit',
          '& textarea': { py: '7px', lineHeight: 1.45 },
          // Windows high-contrast mode drops the border colour change, but shows outlines
          '&.Mui-focused': { outline: '2px solid transparent' },
        }}
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '8px',
          mt: '6px',
          fontSize: '12px',
          color: 'text.secondary',
        }}
      >
        <span id={hintId}>{t('helpChatbot:inputHint')}</span>
        {showCounter && (
          <span>
            <span aria-hidden="true">
              {draft.length} / {MAX_QUESTION_LENGTH}
            </span>
            <Box component="span" id={counterId} sx={visuallyHidden}>
              {t('helpChatbot:characterCount', { length: draft.length, max: MAX_QUESTION_LENGTH })}
            </Box>
          </span>
        )}
      </Box>
    </Box>
  )
}

export default Composer
