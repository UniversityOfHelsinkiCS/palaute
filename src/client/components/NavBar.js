import React from 'react'

import {
  AppBar,
  Button,
  Typography,
  Toolbar,
  IconButton,
  makeStyles,
} from '@material-ui/core'

import MenuIcon from '@material-ui/icons/Menu'

import toskaLogo from '../assets/toscalogo_white.svg'

const useLogoStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexGrow: 1,
  },
  image: {
    width: '2.5rem',
    height: 'auto',
    marginLeft: theme.spacing(1),
  },
}))

const useNavBarStyles = makeStyles((theme) => ({
  menuButton: {
    marginRight: theme.spacing(2),
  },
}))

const Logo = () => {
  const classes = useLogoStyles()

  return (
    <div className={classes.container}>
      <Typography variant="h6">Palaute</Typography>
      <img src={toskaLogo} alt="Toska" className={classes.image} />
    </div>
  )
}

const NavBar = () => {
  const classes = useNavBarStyles()

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          className={classes.menuButton}
          edge="start"
          color="inherit"
          aria-label="menu"
        >
          <MenuIcon />
        </IconButton>
        <Logo />
        <Button color="inherit">Log out</Button>
      </Toolbar>
    </AppBar>
  )
}

export default NavBar
