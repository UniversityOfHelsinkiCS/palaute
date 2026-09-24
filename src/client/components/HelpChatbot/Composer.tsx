import type { Ref } from 'react'

import { ArrowUpward } from '@mui/icons-material'
import { Box, IconButton, InputAdornment, OutlinedInput } from '@mui/material'
import { visuallyHidden } from '@mui/utils'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { focusIndicatorStyle } from '../../util/accessibility'
import { mergeSx } from '../../util/sx'

type ComposerProps = {
  inputRef: Ref<HTMLTextAreaElement>
  draft: string
  onDraftChange: (draft: string) => void
}

const Composer = ({ inputRef, draft, onDraftChange }: ComposerProps) => {
  const { t } = useTranslation()
  const inputId = useId()

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
        placeholder={t('helpChatbot:inputPlaceholder')}
        endAdornment={
          <InputAdornment position="end" sx={{ height: 'auto', maxHeight: 'none', alignSelf: 'flex-end' }}>
            <IconButton
              aria-label={t('helpChatbot:send')}
              disabled
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
    </Box>
  )
}

export default Composer
