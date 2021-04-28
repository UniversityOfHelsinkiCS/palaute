import React from 'react'

import { AppBar, Typography, Toolbar, makeStyles } from '@material-ui/core'

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import FeedbacksIcon from '@material-ui/icons/Feedback'
import TeacherSettingsIcon from '@material-ui/icons/Settings'
import useTeacherCourseUnits from '../../hooks/useTeacherCourseUnits'

import AdminNavButton from './AdminNavButton'
import LogOutNavButton from './LogOutNavButton'
import NavIconButton from './NavIconButton'
import toskaLogo from '../../assets/toscalogo_white.svg'

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
        <img src={toskaLogo} alt="Toska" className={classes.image} />
      </Link>
    </div>
  )
}

const NavBar = () => {
  const { courseUnits } = useTeacherCourseUnits()
  const { t } = useTranslation()

  const hasCourses = Boolean(courseUnits?.length)

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Logo />
          <NavIconButton to="/" tooltipTitle={t('navBar:myFeedbacks')}>
            <FeedbacksIcon />
          </NavIconButton>
          {hasCourses && (
            <NavIconButton to="/courses" tooltipTitle={t('navBar:myCourses')}>
              <TeacherSettingsIcon />
            </NavIconButton>
          )}
          <AdminNavButton />
          <LogOutNavButton />
        </Toolbar>
      </AppBar>
    </>
  )
}

export default NavBar
