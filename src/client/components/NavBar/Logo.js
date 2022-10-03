import React from 'react'
/** @jsxImportSource @emotion/react */

import { Box } from '@mui/material'

import { Link } from 'react-router-dom'
import hyLogo from '../../assets/hy_logo.svg'

const styles = {
  link: {
    marginRight: 4,
  },
  image: {
    width: '2.5rem',
    height: 'auto',
    '&:hover': {
      fill: 'white',
    },
  },
}

const Logo = ({ guest = false }) => (
  <Link to={guest ? '/noad' : '/'} style={{ textDecoration: 'none' }}>
    <Box display="inline-flex" alignItems="end" sx={styles.link}>
      <img src={hyLogo} alt="HY" css={styles.image} />
      <Box
        ml="1rem"
        pb="0.2rem"
        color="white"
        textTransform="uppercase"
        fontWeight={700}
        fontSize={18}
        fontFamily="sans-serif"
      >
        Norppa
      </Box>
    </Box>
  </Link>
)

export default Logo
