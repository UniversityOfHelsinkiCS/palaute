import type { Ref } from 'react'

import { Box } from '@mui/material'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { PILL_PADDING_LEFT, PILL_PADDING_RIGHT, getPillWidth } from './layout'
import useElementSize from './useElementSize'

type PillViewProps = {
  buttonRef: Ref<HTMLButtonElement>
  onOpen: () => void
  onWidthChange: (width: number) => void
}

const PillView = ({ buttonRef, onOpen, onWidthChange }: PillViewProps) => {
  const { t } = useTranslation()
  const labelRef = useRef<HTMLSpanElement>(null)

  // Measured rather than fixed per language, as translations can be overridden per deployment
  useElementSize(labelRef, ({ width }) => onWidthChange(getPillWidth(width)))

  return (
    <Box
      component="button"
      type="button"
      ref={buttonRef}
      onClick={onOpen}
      sx={{
        width: '100%',
        height: '100%',
        p: `0 ${PILL_PADDING_RIGHT}px 0 ${PILL_PADDING_LEFT}px`,
        border: 0,
        bgcolor: 'transparent',
        font: 'inherit',
        fontSize: '14.5px',
        fontWeight: 600,
        color: 'primary.dark',
        textAlign: 'left',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        // The focus ring is drawn on the widget box
        outline: 'none',
      }}
    >
      <Box component="span" ref={labelRef} sx={{ display: 'inline-block' }}>
        {t('helpChatbot:pillLabel')}
      </Box>
    </Box>
  )
}

export default PillView
