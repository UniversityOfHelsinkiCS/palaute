import React from 'react'
/** @jsxImportSource @emotion/react */

import { Box, Typography } from '@mui/material'

import { Link } from 'react-router-dom'
import hyLogo from '../../assets/hy_logo.svg'

const styles = {
  link: {
    textDecoration: 'none',
    marginRight: 4,
  },
  image: {
    width: '2.5rem',
    height: 'auto',
  },
}

const Logo = () => (
  <Box sx={styles.link}>
    <Link to="/">
      <Box display="inline-flex" alignItems="center">
        <img src={hyLogo} alt="HY" css={styles.image} />
        <Box mr={1} />
        <Typography variant="h6" component="h1" color="white">
          Norppa
        </Typography>
      </Box>
    </Link>
  </Box>
)

export default Logo
