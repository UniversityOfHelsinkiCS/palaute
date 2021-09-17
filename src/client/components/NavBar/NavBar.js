import React, { useRef, useState, forwardRef } from 'react'

import {
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

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import cn from 'classnames'

import MenuIcon from '@material-ui/icons/Menu'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'

import useFeedbackTargetsForStudent from '../../hooks/useFeedbackTargetsForStudent'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import Logo from './Logo'
import { handleLogout, isAdmin } from './utils'
import useCourseSummaryAccessInfo from '../../hooks/useCourseSummaryAccessInfo'

const useStyles = makeStyles((theme) => ({
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
    fontWeight: theme.typography.fontWeightMedium,
  },
  linkContainer: {
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
  },
  mobileMenuButton: {
    marginLeft: 'auto',
  },
  languageMenuDivider: {
    margin: theme.spacing(1, 0),
  },
}))

const useLanguageMenuStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
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

const LanguageMenu = forwardRef(({ language, onLanguageChange }, ref) => {
  const classes = useLanguageMenuStyles()

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

const NavBar = () => {
  const classes = useStyles()
  const { feedbackTargets } = useFeedbackTargetsForStudent()
  const { authorizedUser } = useAuthorizedUser()
  const { courseSummaryAccessInfo } = useCourseSummaryAccessInfo()
  const { t, i18n } = useTranslation()
  const menuButtonRef = useRef()
  const [menuOpen, setMenuOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width:500px)')

  const isStudent = Boolean(feedbackTargets?.length)
  const isTeacher = Boolean(authorizedUser?.isTeacher)
  const isAdminUser = isAdmin(authorizedUser)
  const courseSummaryIsAccessible = courseSummaryAccessInfo?.accessible ?? false

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
    <IconButton
      color="inherit"
      className={classes.mobileMenuButton}
      aria-label={menuLabel}
      {...menuButtonProps}
    >
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
    courseSummaryIsAccessible && {
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
