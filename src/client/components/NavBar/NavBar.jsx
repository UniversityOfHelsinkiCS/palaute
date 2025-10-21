import React, { useRef, useState, forwardRef } from 'react'

import {
  AppBar,
  Toolbar,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  ButtonBase,
  Box,
  Container,
  Badge,
} from '@mui/material'
import { uniq } from 'lodash-es'

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
import useNorppaFeedbackCount from '../../hooks/useNorppaFeedbackCount'
import useLocalStorageState from '../../hooks/useLocalStorageState'
import UserPermissionsWindow from './UserPermissionsWindow'
import useIsMobile from '../../hooks/useIsMobile'
import Banner from '../common/Banner'
import { LANGUAGES, PUBLIC_COURSE_BROWSER_ENABLED } from '../../util/common'
import useWaitingFeedbackCount from './useWaitingFeedbackCount'

const styles = {
  toolbar: {
    display: 'flex',
    width: '100%',
    '@media print': {
      display: 'none',
    },
    padding: '0.5rem 0 0.5rem 0',
  },
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    color: 'inherit',
    textDecoration: 'none',
    marginRight: '0.1rem',
    fontWeight: theme => theme.typography.fontWeightMedium,
    padding: '7px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0)',
    transition: 'background-color 0.1s',
    borderRadius: '0.5rem',
    minWidth: 'max-content',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.22)',
    },
  },
  activeLink: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  linkContainer: {
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
    paddingRight: '1rem',
    marginRight: 'auto',
  },
  menuButton: {
    display: 'flex',
    minWidth: 'max-content',
    marginLeft: 'auto',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.22)',
    },
  },
  languageMenuDivider: {
    margin: theme => theme.spacing(1, 0),
  },
  norppaFeedback: {
    background: theme => theme.palette.warning.main,
    color: 'black',
    padding: '4px 10px',
    borderRadius: 2,
    fontWeight: 'bold',
    alignItems: 'center',
    display: 'flex',
    '&:hover': {
      background: theme => theme.palette.warning.light,
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
    color: theme => theme.palette.primary.main,
    fontWeight: theme => theme.typography.fontWeightMedium,
  },
}
const LanguageMenu = forwardRef(({ language, onLanguageChange }, ref) => (
  <Box sx={styles.container} ref={ref}>
    {LANGUAGES.map(l => (
      <MenuItem key={l} sx={[styles.item, language === l && styles.activeItem]} onClick={() => onLanguageChange(l)}>
        {l.toUpperCase()}
      </MenuItem>
    ))}
  </Box>
))

const NavLabelWrapper = ({ renderBadge, children }) => {
  const { t } = useTranslation()

  const baseElement = (
    <Box fontWeight="fontWeightMedium" fontSize={15} mx={1}>
      {children}
    </Box>
  )

  if (renderBadge) {
    return (
      <Badge data-cy="navbar-notification-badge" aria-label={t('navBar:badgeLabel')} color="secondary" variant="dot">
        {baseElement}
      </Badge>
    )
  }

  return baseElement
}

const NavBar = ({ guest = false }) => {
  const menuButtonRef = useRef()
  const { pathname } = useLocation()
  const { t, i18n } = useTranslation()
  const isMobile = useIsMobile()
  const { feedbackTargets } = useFeedbackTargetsForStudent({ enabled: !guest })
  const { authorizedUser } = useAuthorizedUser({ enabled: !guest })
  const [seenBannerIds, setSeenBannerIds] = useLocalStorageState('seen-banner-ids')

  const [menuOpen, setMenuOpen] = useState(false)
  const [permissionsWindowOpen, setPermissionsWindowOpen] = useState(false)

  const isStudent = Boolean(
    feedbackTargets?.waiting?.length || feedbackTargets?.given?.length || feedbackTargets?.ended?.length
  )
  const isAdminUser = authorizedUser?.isAdmin ?? false

  const { norppaFeedbackCount, isLoading } = useNorppaFeedbackCount({
    enabled: isAdminUser,
  })
  const { waitingFeedbackCount } = useWaitingFeedbackCount({
    enabled: isStudent,
  })

  const preferences = authorizedUser?.preferences ?? {}
  const courseSummaryIsAccessible = preferences?.hasSummaryAccess ?? false
  const myCoursesIsAccessible = preferences?.hasCourseAccess ?? false

  const handleCloseMenu = () => {
    setMenuOpen(false)
  }

  const handleOpenMenu = () => {
    setMenuOpen(true)
  }

  const handleBannerClose = id => {
    const newIds = uniq((seenBannerIds ?? []).concat(id))
    setSeenBannerIds(newIds)
  }

  const fullName = [authorizedUser?.firstName, authorizedUser?.lastName].filter(Boolean).join(' ')

  const menuLabel = fullName || t('navBar:nameFallback')

  const menuButtonProps = {
    onClick: handleOpenMenu,
    ref: menuButtonRef,
    'aria-controls': 'navBarMenu',
    'aria-haspopup': 'true',
  }

  const desktopMenuButton = (
    <Button color="inherit" endIcon={<KeyboardArrowDownIcon />} sx={styles.menuButton} {...menuButtonProps}>
      <PersonOutlined />
      <Box fontSize={14} ml={1}>
        {menuLabel}
      </Box>
    </Button>
  )

  const mobileMenuButton = (
    <IconButton color="inherit" sx={styles.menuButton} aria-label={menuLabel} {...menuButtonProps} size="large">
      <MenuIcon />
    </IconButton>
  )

  const links = [
    myCoursesIsAccessible && {
      label: t('navBar:myCourses'),
      to: '/courses',
    },
    isStudent && {
      label: t('navBar:myFeedbacks'),
      to: '/feedbacks',
      badgeCount: waitingFeedbackCount,
    },
    PUBLIC_COURSE_BROWSER_ENABLED &&
      !guest && {
        label: t('navBar:browseCourses'),
        to: '/search',
      },
    courseSummaryIsAccessible && {
      label: t('navBar:courseSummary'),
      to: '/course-summary',
    },
    (myCoursesIsAccessible || courseSummaryIsAccessible) && {
      label: t('navBar:feedback'),
      to: '/norppa-feedback',
    },
    isAdminUser && {
      label: t('navBar:admin'),
      to: '/admin/users',
    },
  ]
    .filter(Boolean)
    .map(link => ({
      ...link,
      active: matchPath({ path: `${link.to}/*` }, pathname),
    }))

  const navBarLinks = (
    <Box data-cy="navbar-links" sx={styles.linkContainer}>
      {links.map(({ label, to, badgeCount, active }) => (
        <ButtonBase
          data-cy={`navbar-link-${label}`}
          component={Link}
          key={label}
          sx={[styles.link, active && styles.activeLink]}
          to={to}
          focusRipple
        >
          <NavLabelWrapper renderBadge={badgeCount}>{label}</NavLabelWrapper>
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

  const changeLanguage = lang => {
    i18n.changeLanguage(lang)
    handleCloseMenu()
  }

  const menu = (
    <Menu id="navBarMenu" anchorEl={() => menuButtonRef.current} keepMounted open={menuOpen} onClose={handleCloseMenu}>
      <LanguageMenu language={i18n.language} onLanguageChange={changeLanguage} />
      {!guest && <Divider component="li" sx={styles.languageMenuDivider} />}
      {!guest && isMobile && mobileMenuLinks}
      {!guest && <MenuItem onClick={() => setPermissionsWindowOpen(true)}>{t('navBar:userInformation')}</MenuItem>}
      {!guest && <Divider component="li" sx={styles.languageMenuDivider} />}
      {!guest && <MenuItem onClick={handleLogout}>{t('navBar:logOut')}</MenuItem>}
    </Menu>
  )

  return (
    <>
      <UserPermissionsWindow isOpen={permissionsWindowOpen} onClose={() => setPermissionsWindowOpen(false)} />
      {menu}
      <AppBar
        elevation={0}
        position="relative"
        sx={{
          zIndex: theme => theme.zIndex.drawer + 1,
          background: theme => theme.palette.primary.dark,
          boxShadow: theme => `0px 0px 10px 1px ${theme.palette.primary.main}`,
          borderRadius: 0,
        }}
      >
        <Container maxWidth={false}>
          <Toolbar sx={styles.toolbar} disableGutters>
            <Logo guest={guest} />
            {!isMobile && navBarLinks}
            {isMobile ? mobileMenuButton : desktopMenuButton}
          </Toolbar>
        </Container>
      </AppBar>
      {authorizedUser?.banners
        ?.filter(banner => !seenBannerIds?.includes(banner.id))
        ?.map(banner => (
          <Banner banner={banner} language={i18n.language} key={banner.id} onClose={handleBannerClose} />
        ))}
    </>
  )
}

export default NavBar
