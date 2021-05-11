import React, { useRef, useState } from 'react'

import {
  AppBar,
  Typography,
  Toolbar,
  makeStyles,
  Button,
  Menu,
  MenuItem,
  useMediaQuery,
  IconButton,
} from '@material-ui/core'

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import MenuIcon from '@material-ui/icons/Menu'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'

import useFeedbackTargetsForStudent from '../../hooks/useFeedbackTargetsForStudent'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import hyLogo from '../../assets/hy_logo.svg'
import { handleLogout, isAdmin } from './utils'

const useStyles = makeStyles({
  toolbar: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
  },
})

const useLogoStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexGrow: 1,
  },
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    color: 'inherit',
    textDecoration: 'none',
  },
  image: {
    width: '2.5rem',
    height: 'auto',
    marginLeft: theme.spacing(1),
  },
}))

const Logo = () => {
  const classes = useLogoStyles()

  return (
    <div className={classes.container}>
      <Link to="/" className={classes.link}>
        <Typography variant="h6" component="h1">
          Palaute
        </Typography>
        <img src={hyLogo} alt="HY" className={classes.image} />
      </Link>
    </div>
  )
}

const NavBar = () => {
  const classes = useStyles()
  const { feedbackTargets } = useFeedbackTargetsForStudent()
  const { authorizedUser } = useAuthorizedUser()
  const { t } = useTranslation()
  const menuButtonRef = useRef()
  const [menuOpen, setMenuOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width:400px)')

  const isStudent = Boolean(feedbackTargets?.length)
  const isTeacher = Boolean(authorizedUser?.isTeacher)
  const isAdminUser = isAdmin(authorizedUser)

  const handleCloseMenu = () => {
    setMenuOpen(false)
  }

  const handleOpenMenu = () => {
    setMenuOpen(true)
  }

  const links = [
    isStudent &&
      isTeacher && {
        label: t('navBar:myFeedbacks'),
        to: '/feedbacks',
      },
    isAdminUser && {
      label: t('navBar:admin'),
      to: '/admin',
    },
  ].filter(Boolean)

  const fullName = [authorizedUser?.firstName, authorizedUser?.lastName]
    .filter(Boolean)
    .join(' ')

  const menuLabel = fullName || t('navBar:nameFallback')

  const menuButtonProps = {
    onClick: handleOpenMenu,
    ref: menuButtonRef,
    'aria-controls': 'navBarMenu',
    'aria-haspopup': 'true',
  }

  const menu = (
    <Menu
      id="navBarMenu"
      anchorEl={menuButtonRef.current}
      keepMounted
      open={menuOpen}
      onClose={handleCloseMenu}
    >
      {links.map(({ label, to }) => (
        <MenuItem component={Link} to={to} onClick={handleCloseMenu}>
          {label}
        </MenuItem>
      ))}
      <MenuItem onClick={handleLogout}>{t('navBar:logOut')}</MenuItem>
    </Menu>
  )

  const desktopMenuButton = (
    <Button
      color="inherit"
      endIcon={<KeyboardArrowDownIcon />}
      {...menuButtonProps}
    >
      {menuLabel}
    </Button>
  )

  const mobileMenuButton = (
    <IconButton color="inherit" aria-label={menuLabel} {...menuButtonProps}>
      <MenuIcon />
    </IconButton>
  )

  return (
    <>
      {menu}
      <AppBar position="static">
        <Toolbar className={classes.toolbar}>
          <Logo />

          {isMobile ? mobileMenuButton : desktopMenuButton}
        </Toolbar>
      </AppBar>
    </>
  )
}

export default NavBar
