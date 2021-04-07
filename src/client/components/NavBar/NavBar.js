import React from 'react'

import {
  AppBar,
  Typography,
  Toolbar,
  IconButton,
  Tooltip,
  makeStyles,
} from '@material-ui/core'

import { Link } from 'react-router-dom'

import LogOutIcon from '@material-ui/icons/ExitToApp'
import FeedbacksIcon from '@material-ui/icons/Assignment'
import TeacherSettingsIcon from '@material-ui/icons/Settings'
import { useTeacherCourses } from '../../util/queries'

import toskaLogo from '../../assets/toscalogo_white.svg'

const useLogoStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexGrow: 1,
    color: 'inherit',
    textDecoration: 'none',
  },
  image: {
    width: '2.5rem',
    height: 'auto',
    marginLeft: theme.spacing(1),
  },
}))

const useNavIconButtonStyles = makeStyles((theme) => ({
  button: {
    marginLeft: theme.spacing(1),
  },
}))

const Logo = () => {
  const classes = useLogoStyles()

  return (
    <Link to="/" className={classes.container}>
      <Typography variant="h6">Palaute</Typography>
      <img src={toskaLogo} alt="Toska" className={classes.image} />
    </Link>
  )
}

const NavIconButton = ({ children, tooltipTitle, to, onClick }) => {
  const classes = useNavIconButtonStyles()

  const component = to ? Link : 'button'

  return (
    <Tooltip title={tooltipTitle}>
      <IconButton
        edge="start"
        color="inherit"
        component={component}
        aria-label={tooltipTitle}
        to={to}
        className={classes.button}
        onClick={onClick}
      >
        {children}
      </IconButton>
    </Tooltip>
  )
}

const NavBar = () => {
  const { data: courses } = useTeacherCourses()

  const hasCourses = Boolean(courses?.length)

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Logo />
          <NavIconButton to="/" tooltipTitle="My feedbacks">
            <FeedbacksIcon />
          </NavIconButton>
          {hasCourses && (
            <NavIconButton to="/list" tooltipTitle="My courses">
              <TeacherSettingsIcon />
            </NavIconButton>
          )}
          <NavIconButton tooltipTitle="Log out">
            <LogOutIcon />
          </NavIconButton>
        </Toolbar>
      </AppBar>
    </>
  )
}

export default NavBar
