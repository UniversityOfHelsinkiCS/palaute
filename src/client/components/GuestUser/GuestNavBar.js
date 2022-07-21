import React, { useRef, useState, forwardRef } from 'react'
/** @jsxImportSource @emotion/react */

import { Link } from 'react-router-dom'

import {
  Typography,
  AppBar,
  Toolbar,
  Button,
  Menu,
  MenuItem,
  useMediaQuery,
  IconButton,
  Divider,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { useTranslation } from 'react-i18next'

import hyLogo from '../../assets/hy_logo.svg'

const styles = {
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
    marginRight: (theme) => theme.spacing(1),
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
    margin: (theme) => theme.spacing(1, 0),
  },
  item: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  activeItem: {
    color: (theme) => theme.palette.primary.main,
    fontWeight: (theme) => theme.typography.fontWeightMedium,
  },
}

const Logo = () => (
  <div css={styles.container}>
    <Link to="/noad/courses" sx={styles.logoLink}>
      <img src={hyLogo} alt="HY" css={styles.image} />
      <Typography variant="h6" component="h1">
        Norppa
      </Typography>
    </Link>
  </div>
)

const LanguageMenu = forwardRef(({ language, onLanguageChange }, ref) => {
  const languages = ['fi', 'sv', 'en']

  return (
    <div css={styles.container} ref={ref}>
      {languages.map((l) => (
        <MenuItem
          key={l}
          sx={[styles.item, language === l && styles.activeItem]}
          onClick={() => onLanguageChange(l)}
        >
          {l.toUpperCase()}
        </MenuItem>
      ))}
    </div>
  )
})

const GuestNavBar = () => {
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
      css={styles.mobileMenuButton}
      aria-label={menuLabel}
      {...menuButtonProps}
      size="large"
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

  const loggedIn = localStorage.getItem('token')

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
      {!!loggedIn && (
        <div>
          <Divider component="li" sx={styles.languageMenuDivider} />
          <MenuItem onClick={handleLogout}>{t('navBar:logOut')}</MenuItem>
        </div>
      )}
    </Menu>
  )

  return (
    <>
      {menu}
      <AppBar position="static">
        <Toolbar sx={styles.toolbar}>
          <Logo />
          {isMobile ? mobileMenuButton : desktopMenuButton}
        </Toolbar>
      </AppBar>
    </>
  )
}

export default GuestNavBar
