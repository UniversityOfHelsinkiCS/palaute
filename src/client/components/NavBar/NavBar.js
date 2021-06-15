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
import useOrganisations from '../../hooks/useOrganisations'

const useStyles = makeStyles({
  toolbar: {
    display: 'flex',
    width: '100%',
  },
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    color: 'inherit',
    textDecoration: 'none',
    marginRight: 20,
  },
  linkContainer: {
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
  },
})

const useLogoStyles = makeStyles((theme) => ({
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
  const classes = useLogoStyles()

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

const NavBar = () => {
  const classes = useStyles()
  const { feedbackTargets } = useFeedbackTargetsForStudent()
  const { authorizedUser } = useAuthorizedUser()
  const { organisations } = useOrganisations()
  const { t, i18n } = useTranslation()
  const menuButtonRef = useRef()
  const [menuOpen, setMenuOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width:400px)')

  const isStudent = Boolean(feedbackTargets?.length)
  const isTeacher = Boolean(authorizedUser?.isTeacher)
  const isAdminUser = isAdmin(authorizedUser)

  const hasSomeOrganisationAccess = (organisations ?? []).some((o) =>
    Boolean(o.access),
  )

  const handleCloseMenu = () => {
    setMenuOpen(false)
  }

  const handleOpenMenu = () => {
    setMenuOpen(true)
  }

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

  const links = [
    isTeacher && {
      label: t('navBar:myCourses'),
      to: '/courses',
    },
    isStudent && {
      label: t('navBar:myFeedbacks'),
      to: '/feedbacks',
    },
    hasSomeOrganisationAccess && {
      label: t('navBar:courseSummary'),
      to: '/course-summary',
    },
    isAdminUser && {
      label: t('navBar:admin'),
      to: '/admin',
    },
  ].filter(Boolean)

  const navBarLinks = (
    <div className={classes.linkContainer}>
      {links.map(({ label, to }, index) => (
        <Link key={index} className={classes.link} to={to}>
          {label}
        </Link>
      ))}
    </div>
  )

  const mobileMenuLinks = links.map(({ label, to }, index) => (
    <MenuItem key={index} component={Link} to={to}>
      {label}
    </MenuItem>
  ))

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang)
    handleCloseMenu()
  }

  const languageOptions = [
    i18n.language !== 'fi' && {
      label: 'Suomi',
      lang: 'fi',
    },
    i18n.language !== 'en' && {
      label: 'English',
      lang: 'en',
    },
    i18n.language !== 'sv' && {
      label: 'Svenska',
      lang: 'sv',
    },
  ].filter(Boolean)

  const menu = (
    <Menu
      id="navBarMenu"
      anchorEl={menuButtonRef.current}
      keepMounted
      open={menuOpen}
      onClose={handleCloseMenu}
    >
      {languageOptions.map(({ label, lang }, index) => (
        <MenuItem
          key={index}
          component={Link}
          onClick={() => changeLanguage(lang)}
        >
          {label}
        </MenuItem>
      ))}
      {isMobile && mobileMenuLinks}
      <MenuItem onClick={handleLogout}>{t('navBar:logOut')}</MenuItem>
    </Menu>
  )

  return (
    <>
      {menu}
      <AppBar position="static">
        <Toolbar className={classes.toolbar}>
          <Logo />
          {!isMobile && navBarLinks}
          {isMobile ? mobileMenuButton : desktopMenuButton}
        </Toolbar>
      </AppBar>
    </>
  )
}

export default NavBar
