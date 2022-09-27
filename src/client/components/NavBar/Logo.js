import React from 'react'
/** @jsxImportSource @emotion/react */

import { Box, Typography } from '@mui/material'

import { Link } from 'react-router-dom'
import hyLogo from '../../assets/hy_logo.svg'

const styles = {
  link: {
    marginRight: 4,
  },
  image: {
    width: '2.5rem',
    height: 'auto',
  },
}

const Logo = ({ guest = false }) => (
  <Link to={guest ? '/noad' : '/'} style={{ textDecoration: 'none' }}>
    <Box display="inline-flex" alignItems="center" sx={styles.link}>
      <img src={hyLogo} alt="HY" css={styles.image} />
      <Box mr={1} />
      <Typography variant="h6" component="h1" color="white">
        Norppa
      </Typography>
    </Box>
  </Link>
)

export default Logo
