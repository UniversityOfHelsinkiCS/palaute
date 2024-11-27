import React from 'react'
import { Box, Button, Grid2 as Grid, Paper } from '@mui/material'
import { Close } from '@mui/icons-material'
import Markdown from './Markdown'
import { getLanguageValue } from '../../util/languageUtils'

const styles = {
  container: color => ({
    width: '100%',
    zIndex: theme => theme.zIndex.drawer + 2,
    background: color,
    color: theme => theme.palette.getContrastText(color),
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
  close: color => ({
    color: theme => theme.palette.getContrastText(color),
    marginLeft: '1rem',
    justifySelf: 'end',
    minWidth: 50,
  }),
}

const Banner = ({ banner, language, onClose = () => {}, disabled }) => (
  <Box width="100vw">
    <Paper sx={styles.container(banner.data?.color ?? '#fff')} elevation={0}>
      <Grid container direction="row" justifyContent="space-between">
        <Grid>
          <Markdown>{getLanguageValue(banner.data?.text, language)}</Markdown>
        </Grid>
        <Grid>
          <Button
            disabled={disabled}
            onClick={() => onClose(banner.id)}
            sx={styles.close(banner.data?.color ?? '#fff')}
          >
            <Close />
          </Button>
        </Grid>
      </Grid>
    </Paper>
  </Box>
)

export default Banner
