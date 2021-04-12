import React from 'react'

import { IconButton, Tooltip, makeStyles } from '@material-ui/core'

import { Link } from 'react-router-dom'

const useNavIconButtonStyles = makeStyles((theme) => ({
  button: {
    marginLeft: theme.spacing(1),
  },
}))

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

export default NavIconButton
