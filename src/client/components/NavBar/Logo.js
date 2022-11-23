import React from 'react'
/** @jsxImportSource @emotion/react */

import { Box } from '@mui/material'

import { Link } from 'react-router-dom'
import hyLogo from '../../assets/hy_logo.svg'

const styles = {
  link: {
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
}

const Logo = ({ guest = false }) => (
  <Link to={guest ? '/noad' : '/'} style={{ textDecoration: 'none' }}>
    <Box display="inline-flex" alignItems="end" sx={styles.link}>
      <img src={hyLogo} alt="HY" css={styles.image} />
      <Box
        ml="1rem"
        pb="0.2rem"
        textTransform="uppercase"
        fontWeight={700}
        fontSize={18}
      >
        Norppa
      </Box>
    </Box>
  </Link>
)

export default Logo
