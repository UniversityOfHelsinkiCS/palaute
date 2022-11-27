import React from 'react'
import { Box, Button, Paper } from '@mui/material'
import { Close } from '@mui/icons-material'
import Markdown from './Markdown'
import { getLanguageValue } from '../../util/languageUtils'

const styles = {
  container: (color) => ({
    width: '100%',
    zIndex: (theme) => theme.zIndex.drawer + 2,
    background: color,
    color: (theme) => theme.palette.getContrastText(color),
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
  close: (color) => ({
    color: (theme) => theme.palette.getContrastText(color),
    padding: '0.2rem',
    marginLeft: '2rem',
    minWidth: 50,
  }),
}

const Banner = ({ banner, language, canClose = true }) => {
  const [visible, setVisible] = React.useState(true)
  return (
    visible && (
      <Box width="100vw">
        <Paper
          sx={styles.container(banner.data?.color ?? '#fff')}
          elevation={0}
        >
          <Markdown>{getLanguageValue(banner.data?.text, language)}</Markdown>
          <Button
            onClick={() => setVisible(!canClose)}
            sx={styles.close(banner.data?.color ?? '#fff')}
          >
            <Close />
          </Button>
        </Paper>
      </Box>
    )
  )
}

export default Banner
