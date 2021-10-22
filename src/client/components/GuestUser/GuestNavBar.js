import React, { useRef, useState, forwardRef } from 'react'
import { Link } from 'react-router-dom'

import {
  Typography,
  AppBar,
  Toolbar,
  makeStyles,
  Button,
  Menu,
  MenuItem,
  useMediaQuery,
  IconButton,
  Divider,
} from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import { useTranslation } from 'react-i18next'
import cn from 'classnames'

import hyLogo from '../../assets/hy_logo.svg'

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
  },
  logoLink: {
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
  toolbar: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
  },
  mobileMenuButton: {
    marginLeft: 'auto',
  },
  languageMenuDivider: {
    margin: theme.spacing(1, 0),
  },
  item: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  activeItem: {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightMedium,
  },
}))

const Logo = () => {
  const classes = useStyles()

  return (
    <div className={classes.container}>
      <Link to="/noad/courses" className={classes.logoLink}>
        <img src={hyLogo} alt="HY" className={classes.image} />
        <Typography variant="h6" component="h1">
          Norppa
        </Typography>
      </Link>
    </div>
  )
}

const LanguageMenu = forwardRef(({ language, onLanguageChange }, ref) => {
  const classes = useStyles()

  const languages = ['fi', 'sv', 'en']

  return (
    <div className={classes.container} ref={ref}>
      {languages.map((l) => (
        <MenuItem
          key={l}
          className={cn(classes.item, language === l && classes.activeItem)}
          onClick={() => onLanguageChange(l)}
        >
          {l.toUpperCase()}
        </MenuItem>
      ))}
    </div>
  )
})

const GuestNavBar = () => {
  const classes = useStyles()
  const { t, i18n } = useTranslation()
  const menuButtonRef = useRef()
  const [menuOpen, setMenuOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width:500px)')

  const handleCloseMenu = () => {
    setMenuOpen(false)
  }

  const handleOpenMenu = () => {
    setMenuOpen(true)
  }

  const menuLabel = t('navBar:nameFallback')

  const menuButtonProps = {
    onClick: handleOpenMenu,
    ref: menuButtonRef,
    'aria-controls': 'navBarMenu',
    'aria-haspopup': 'true',
  }

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
    <IconButton
      color="inherit"
      className={classes.mobileMenuButton}
      aria-label={menuLabel}
      {...menuButtonProps}
    >
      <MenuIcon />
    </IconButton>
  )

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang)
    handleCloseMenu()
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.reload()
  }

  const menu = (
    <Menu
      id="navBarMenu"
      anchorEl={menuButtonRef.current}
      keepMounted
      open={menuOpen}
      onClose={handleCloseMenu}
    >
      <LanguageMenu
        language={i18n.language}
        onLanguageChange={changeLanguage}
      />
      <Divider component="li" className={classes.languageMenuDivider} />
      <MenuItem onClick={handleLogout}>{t('navBar:logOut')}</MenuItem>
    </Menu>
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

export default GuestNavBar
