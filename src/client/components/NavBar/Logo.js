import React from 'react'

import { Typography, makeStyles } from '@mui/material'

import { Link } from 'react-router-dom'
import hyLogo from '../../assets/hy_logo.svg'

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
  },
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    color: 'inherit',
    textDecoration: 'none',
    marginRight: 30,
  },
  image: {
    width: '2.5rem',
    height: 'auto',
    marginRight: theme.spacing(1),
  },
}))

const Logo = () => {
  const classes = useStyles()

  return (
    <div className={classes.container}>
      <Link to="/" className={classes.link}>
        <img src={hyLogo} alt="HY" className={classes.image} />
        <Typography variant="h6" component="h1">
          Norppa
        </Typography>
      </Link>
    </div>
  )
}

export default Logo
