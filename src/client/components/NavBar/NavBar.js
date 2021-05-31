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
          Palaute
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

  // eslint-disable-next-line
  const hasSomeOrganisationAccess = (organisations ?? []).some((o) =>
    Boolean(o.access),
  )

  const handleCloseMenu = () => {
    setMenuOpen(false)
  }

  const handleOpenMenu = () => {
    setMenuOpen(true)
  }

  const links = [
    isTeacher && {
      label: t('navBar:myCourses'),
      to: '/courses',
    },
    isStudent &&
      isTeacher && {
        label: t('navBar:myFeedbacks'),
        to: '/feedbacks',
      },
    // eslint-disable-next-line
    /* hasSomeOrganisationAccess && {
      label: t('navBar:courseSummary'),
      to: '/course-summary',
    }, */
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
      {links.map(({ label, to }, index) => (
        <MenuItem
          key={index}
          component={Link}
          to={to}
          onClick={handleCloseMenu}
        >
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

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang)
  }

  const languageSelector = (
    <div>
      {i18n.language !== 'fi' && (
        <Button color="inherit" onClick={() => changeLanguage('fi')}>
          Suomi
        </Button>
      )}
      {i18n.language !== 'en' && (
        <Button color="inherit" onClick={() => changeLanguage('en')}>
          English
        </Button>
      )}
      {i18n.language !== 'sv' && (
        <Button color="inherit" onClick={() => changeLanguage('sv')}>
          Svenska
        </Button>
      )}
    </div>
  )

  return (
    <>
      {menu}
      <AppBar position="static">
        <Toolbar className={classes.toolbar}>
          <Logo />
          {languageSelector}
          {isMobile ? mobileMenuButton : desktopMenuButton}
        </Toolbar>
      </AppBar>
    </>
  )
}

export default NavBar
