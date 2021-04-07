import React from 'react'

import {
  AppBar,
  Button,
  Typography,
  Toolbar,
  IconButton,
  Tooltip,
  makeStyles,
} from '@material-ui/core'

import { Link } from 'react-router-dom'

import MenuIcon from '@material-ui/icons/Menu'
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

const useNavBarStyles = makeStyles((theme) => ({
  menuButton: {
    marginRight: theme.spacing(2),
  },
}))

const useIconLinkStyles = makeStyles((theme) => ({
  link: {
    marginRight: theme.spacing(1),
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

const IconLink = ({ children, tooltipTitle, to }) => {
  const classes = useIconLinkStyles()

  return (
    <Tooltip title={tooltipTitle}>
      <IconButton
        edge="start"
        color="inherit"
        component={Link}
        aria-label={tooltipTitle}
        to={to}
        className={classes.link}
      >
        {children}
      </IconButton>
    </Tooltip>
  )
}

const NavBar = () => {
  const classes = useNavBarStyles()
  const { data: courses } = useTeacherCourses()

  const hasCourses = Boolean(courses?.length)

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            className={classes.menuButton}
            edge="start"
            color="inherit"
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
          <Logo />
          <IconLink to="/" tooltipTitle="My feedbacks">
            <FeedbacksIcon />
          </IconLink>
          {hasCourses && (
            <IconLink to="/list" tooltipTitle="My courses">
              <TeacherSettingsIcon />
            </IconLink>
          )}
          <Button color="inherit">Log out</Button>
        </Toolbar>
      </AppBar>
    </>
  )
}

export default NavBar
