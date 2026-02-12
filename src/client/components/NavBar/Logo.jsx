import React from 'react'
/** @jsxImportSource @emotion/react */

import { useTranslation } from 'react-i18next'

import merge from 'lodash/merge'
import { Link } from 'react-router-dom'

import Box from '@mui/material/Box'

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
  const { t } = useTranslation()
  const customUiConfig = useUiConfig()
  const customStyles = customUiConfig?.styles?.logo ?? {}
  const logoStyles = merge(styles, customStyles)
  const customLogo = customUiConfig?.images?.logo

  return (
    <Link to={guest ? '/noad' : '/'} style={{ textDecoration: 'none' }} aria-label={t('navBar:norppa')}>
      <Box sx={logoStyles.link}>
        <img src={customLogo || hyLogo} alt="" aria-hidden="true" style={logoStyles.image} />
        <span style={logoStyles.text}>Norppa</span>
      </Box>
    </Link>
  )
}

export default Logo
