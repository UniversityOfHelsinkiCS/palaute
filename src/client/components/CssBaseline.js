import React from 'react'
import { CssBaseline as MuiCssBaseline } from '@mui/material'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme) => ({
  '@global': {
    body: {
      ...theme.typography.body1,
      height: '100vh',
    },
    '.shadow-scale-hover-effect': {
      transition: 'all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)',
      borderRadius: theme.shape.borderRadius,
      '&:hover': {
        transform: 'scale(1.0)',
      },
      '&::after': {
        content: '""',
        borderRadius: theme.shape.borderRadius,
        position: 'absolute',
        zIndex: -1,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        boxShadow: '0 3px 9px rgba(0, 0, 0, 0.2)',
        opacity: 0,
        '-webkit-transition': 'all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)',
        transition: 'all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)',
      },
      '&:hover::after': {
        opacity: 1,
      },
    },
  },
}))

const CssBaseline = () => {
  useStyles()

  return <MuiCssBaseline />
}

export default CssBaseline
