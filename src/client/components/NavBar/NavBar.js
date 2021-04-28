import React from 'react'

import { AppBar, Typography, Toolbar, makeStyles } from '@material-ui/core'

import { Link } from 'react-router-dom'

import FeedbacksIcon from '@material-ui/icons/Assignment'
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

  const hasCourses = Boolean(courseUnits?.length)

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Logo />
          <NavIconButton to="/" tooltipTitle="My feedbacks">
            <FeedbacksIcon />
          </NavIconButton>
          {hasCourses && (
            <NavIconButton to="/courses" tooltipTitle="My courses">
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
