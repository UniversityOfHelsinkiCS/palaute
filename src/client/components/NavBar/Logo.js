import React from 'react'
/** @jsxImportSource @emotion/react */

import merge from 'lodash/merge'
import { Box } from '@mui/material'

import { Link } from 'react-router-dom'

import hyLogo from '../../assets/hy_logo.svg'

import { useUiConfig } from '../CustomUiConfigProvider'

const styles = {
  link: {
    alignItems: 'end',
    display: 'inline-flex',
    marginRight: 4,
    textDecoration: 'none',
    borderRadius: 3,
    color: 'white',
    backgroundImage: `-webkit-linear-gradient(0deg, white 0%, white 49%, rgba(255,217,246,1) 55%, rgba(254,200,170,1) 77%, rgba(251,225,189,1) 100%);`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '200%',
    transition: 'background-position-x 0.15s ease-in',
    backgroundPositionX: '0%',
    '&:hover': {
      backgroundPositionX: '70%',
    },
  },
  image: {
    width: '2.5rem',
    height: 'auto',
  },
  text: {
    fontSize: '18px',
    fontWeight: '700',
    marginLeft: '1rem',
    paddingBottom: '0.2rem',
    textTransform: 'uppercase',
  },
}

const Logo = ({ guest = false }) => {
  const customUiConfig = useUiConfig()
  const customStyles = customUiConfig?.styles?.logo ?? {}
  const logoStyles = merge(styles, customStyles)
  const customLogo = customUiConfig?.images?.logo

  return (
    <Link to={guest ? '/noad' : '/'} style={{ textDecoration: 'none' }}>
      <Box sx={logoStyles.link}>
        <img src={customLogo || hyLogo} alt="HY" style={logoStyles.image} />
        <Box css={logoStyles.text}>Norppa</Box>
      </Box>
    </Link>
  )
}

export default Logo
