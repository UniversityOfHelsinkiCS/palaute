import React from 'react'
import { Box, Grid2 as Grid, Paper } from '@mui/material'
import { Close } from '@mui/icons-material'
import type { LanguageId } from '@common/types/common'
import type { BannerData } from '@common/types/banner'
import Markdown from './Markdown'
import { getLanguageValue } from '../../util/languageUtils'
import { NorButton } from './NorButton'

const styles = {
  container: (color: string) => ({
    width: '100%',
    zIndex: (theme: { zIndex: { drawer: number } }) => theme.zIndex.drawer + 2,
    background: color,
    color: (theme: { palette: { getContrastText: (c: string) => string } }) => theme.palette.getContrastText(color),
    padding: '0.3rem',
    paddingLeft: '2rem',
    paddingRight: '2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
  }),
  button: {
    marginTop: 1,
  },
  close: (color: string) => ({
    color: (theme: { palette: { getContrastText: (c: string) => string } }) => theme.palette.getContrastText(color),
    marginLeft: '1rem',
    justifySelf: 'end',
    minWidth: 50,
  }),
  content: {
    display: 'flex',
    alignItems: 'center',
    '& p': {
      margin: 0,
    },
  },
}

interface BannerProps {
  banner: { id?: number; data?: BannerData }
  language: LanguageId | null | undefined
  onClose?: (id: number) => void
  disabled: boolean
}

const Banner = ({ banner, language, onClose = () => {}, disabled }: BannerProps) => (
  <Box width="100vw">
    <Paper sx={styles.container(banner.data?.color ?? '#fff')} elevation={0}>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Box sx={styles.content}>
          <Markdown>{getLanguageValue(banner.data?.text, language)}</Markdown>
        </Box>

        <NorButton
          color="empty"
          disabled={disabled}
          onClick={() => banner.id !== undefined && onClose(banner.id)}
          sx={styles.close(banner.data?.color ?? '#fff')}
        >
          <Close />
        </NorButton>
      </Grid>
    </Paper>
  </Box>
)

export default Banner
