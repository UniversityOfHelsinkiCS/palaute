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
  ButtonBase,
} from '@material-ui/core'

import { Link, useLocation, matchPath } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import cn from 'classnames'

import MenuIcon from '@material-ui/icons/Menu'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import MailOutlineIcon from '@material-ui/icons/MailOutline'
import useFeedbackTargetsForStudent from '../../hooks/useFeedbackTargetsForStudent'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import Logo from './Logo'
import { handleLogout } from './utils'
import useCourseSummaryAccessInfo from '../../hooks/useCourseSummaryAccessInfo'
import NorppaFeedbackBanner from './NorppaFeedbackBanner'
import useNorppaFeedbackCount from '../../hooks/useNorppaFeedbackCount'
import UserPermissionsWindow from './UserPermissionsWindow'

const useStyles = makeStyles((theme) => ({
  toolbar: {
    display: 'flex',
    width: '100%',
    '@media print': {
      display: 'none',
    },
  },
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    color: 'inherit',
    textDecoration: 'none',
    marginRight: 8,
    fontWeight: theme.typography.fontWeightMedium,
    padding: '6px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0)',
    transition: 'background-color 0.25s',
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
  },
  activeLink: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
  norppaFeedback: {
    background: theme.palette.warning.dark,
    color: 'white',
    textDecoration: 'none',
    padding: '6px 12px',
    borderRadius: 4,
    fontWeight: 'bold',
    alignItems: 'center',
    display: 'flex',
    '&:hover': {
      background: theme.palette.warning.main,
    },
  },
  mailIcon: {
    marginLeft: 5,
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
  const { pathname } = useLocation()
  const classes = useStyles()
  const { feedbackTargets } = useFeedbackTargetsForStudent()
  const { authorizedUser } = useAuthorizedUser()
  const { courseSummaryAccessInfo } = useCourseSummaryAccessInfo()
  const { t, i18n } = useTranslation()
  const menuButtonRef = useRef()
  const [menuOpen, setMenuOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width:500px)')
  const [permissionsWindowOpen, setPermissionsWindowOpen] = useState(false)

  const isStudent = Boolean(feedbackTargets?.length)
  const isAdminUser = authorizedUser?.isAdmin ?? false

  const { norppaFeedbackCount, isLoading } = useNorppaFeedbackCount({
    refetchInterval: 60000,
    enabled: isAdminUser,
  })

  const courseSummaryIsAccessible = courseSummaryAccessInfo?.accessible ?? false
  const norppaFeedbackGiven = authorizedUser?.norppaFeedbackGiven ?? false

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
    courseSummaryIsAccessible && {
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
    courseSummaryIsAccessible && {
      label: t('navBar:feedback'),
      to: '/norppa-feedback',
    },
    isAdminUser && {
      label: t('navBar:admin'),
      to: '/admin/users',
    },
  ]
    .filter(Boolean)
    .map((link) => ({
      ...link,
      active: matchPath(pathname, { path: link.to }),
    }))

  const navBarLinks = (
    <div className={classes.linkContainer}>
      {links.map(({ label, to, active }, index) => (
        <ButtonBase
          component={Link}
          key={index}
          className={cn(classes.link, active && classes.activeLink)}
          to={to}
          focusRipple
        >
          {label}
        </ButtonBase>
      ))}
      {isAdminUser && !isLoading && !!norppaFeedbackCount.count && (
        <Link to="/admin/feedback" className={classes.norppaFeedback}>
          {norppaFeedbackCount.count}
          <MailOutlineIcon className={classes.mailIcon} />
        </Link>
      )}
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
      <MenuItem onClick={() => setPermissionsWindowOpen(true)}>
        {t('navBar:userInformation')}
      </MenuItem>
      <Divider component="li" className={classes.languageMenuDivider} />
      <MenuItem onClick={handleLogout}>{t('navBar:logOut')}</MenuItem>
    </Menu>
  )

  return (
    <>
      <UserPermissionsWindow
        isOpen={permissionsWindowOpen}
        onClose={() => setPermissionsWindowOpen(false)}
      />
      {menu}
      <AppBar position="static">
        <Toolbar className={classes.toolbar}>
          <Logo />
          {!isMobile && navBarLinks}
          {isMobile ? mobileMenuButton : desktopMenuButton}
        </Toolbar>
      </AppBar>
      {courseSummaryIsAccessible && !norppaFeedbackGiven && (
        <NorppaFeedbackBanner />
      )}
    </>
  )
}

export default NavBar
