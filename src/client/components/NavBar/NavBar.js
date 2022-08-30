import React, { useRef, useState, forwardRef } from 'react'

import {
  AppBar,
  Toolbar,
  Button,
  Menu,
  MenuItem,
  useMediaQuery,
  IconButton,
  Divider,
  ButtonBase,
  Box,
} from '@mui/material'

import { Link, useLocation, matchPath } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import MenuIcon from '@mui/icons-material/Menu'
import { PersonOutlined } from '@mui/icons-material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import useFeedbackTargetsForStudent from '../../hooks/useFeedbackTargetsForStudent'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import Logo from './Logo'
import { handleLogout } from './utils'
import useCourseSummaryAccessInfo from '../../hooks/useCourseSummaryAccessInfo'
import NorppaFeedbackBanner from './NorppaFeedbackBanner'
import useNorppaFeedbackCount from '../../hooks/useNorppaFeedbackCount'
import UserPermissionsWindow from './UserPermissionsWindow'

const styles = {
  toolbar: {
    display: 'flex',
    width: '100%',
    '@media print': {
      display: 'none',
    },
    padding: '1rem',
  },
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    color: 'inherit',
    textDecoration: 'none',
    marginRight: 1,
    fontWeight: (theme) => theme.typography.fontWeightMedium,
    padding: '6px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0)',
    transition: 'background-color 0.25s',
    borderRadius: 1,
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
    margin: (theme) => theme.spacing(1, 0),
  },
  norppaFeedback: {
    background: (theme) => theme.palette.warning.dark,
    color: 'white',
    padding: '6px 12px',
    borderRadius: 4,
    fontWeight: 'bold',
    alignItems: 'center',
    display: 'flex',
    '&:hover': {
      background: (theme) => theme.palette.warning.main,
    },
  },
  mailIcon: {
    marginLeft: 1,
  },
  container: {
    display: 'flex',
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

const LanguageMenu = forwardRef(({ language, onLanguageChange }, ref) => {
  const languages = ['fi', 'sv', 'en']

  return (
    <Box sx={styles.container} ref={ref}>
      {languages.map((l) => (
        <MenuItem
          key={l}
          sx={[styles.item, language === l && styles.activeItem]}
          onClick={() => onLanguageChange(l)}
        >
          {l.toUpperCase()}
        </MenuItem>
      ))}
    </Box>
  )
})

const NavBar = ({ guest = false }) => {
  const { pathname } = useLocation()
  const { feedbackTargets } = useFeedbackTargetsForStudent({ enabled: !guest })
  const { authorizedUser } = useAuthorizedUser({ enabled: !guest })
  const { courseSummaryAccessInfo } = useCourseSummaryAccessInfo({
    enabled: !guest,
  })
  const { t, i18n } = useTranslation()
  const menuButtonRef = useRef()
  const [menuOpen, setMenuOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width:700px)')
  const [permissionsWindowOpen, setPermissionsWindowOpen] = useState(false)

  const isStudent = Boolean(
    feedbackTargets?.waiting?.length ||
      feedbackTargets?.given?.length ||
      feedbackTargets?.ended?.length,
  )
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
      <PersonOutlined />
      <Box fontSize={14} ml={1}>
        {menuLabel}
      </Box>
    </Button>
  )

  const mobileMenuButton = (
    <IconButton
      color="inherit"
      sx={styles.mobileMenuButton}
      aria-label={menuLabel}
      {...menuButtonProps}
      size="large"
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
    <Box sx={styles.linkContainer}>
      {links.map(({ label, to, active }, index) => (
        <ButtonBase
          component={Link}
          key={index}
          sx={[styles.link, active && styles.activeLink]}
          to={to}
          focusRipple
        >
          <Box fontWeight="fontWeightMedium" fontSize={15} mx={1}>
            {label}
          </Box>
        </ButtonBase>
      ))}
      {isAdminUser && !isLoading && !!norppaFeedbackCount.count && (
        <Link to="/admin/feedback" style={{ textDecoration: 'none' }}>
          <Box sx={styles.norppaFeedback}>
            {norppaFeedbackCount.count}
            <MailOutlineIcon sx={styles.mailIcon} fontSize="small" />
          </Box>
        </Link>
      )}
    </Box>
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
      {!guest && <Divider component="li" sx={styles.languageMenuDivider} />}
      {!guest && isMobile && mobileMenuLinks}
      {!guest && (
        <MenuItem onClick={() => setPermissionsWindowOpen(true)}>
          {t('navBar:userInformation')}
        </MenuItem>
      )}
      {!guest && <Divider component="li" sx={styles.languageMenuDivider} />}
      {!guest && (
        <MenuItem onClick={handleLogout}>{t('navBar:logOut')}</MenuItem>
      )}
    </Menu>
  )

  return (
    <>
      <UserPermissionsWindow
        isOpen={permissionsWindowOpen}
        onClose={() => setPermissionsWindowOpen(false)}
      />
      {menu}
      <AppBar
        position="static"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderRadius: '0 0 0.5rem 0.5rem',
          mb: '1rem',
        }}
      >
        <Toolbar sx={styles.toolbar}>
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
