import React from 'react'
import classNames from 'classnames'
import {
  Tooltip,
  Typography,
  makeStyles,
  Box,
  Divider,
} from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  heading: {
    position: 'absolute',
    display: 'flex',
    // Im not proud of this but it does its thing
    transform:
      'translateX(-50%) translateX(-10px) rotate(-45deg) translateX(50%)',
  },
  title: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '300px',
    fontWeight: theme.typography.fontWeightRegular,
  },
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'end',
    minHeight: '320px',
  },
}))

const VerticalHeading = ({ children, component: Component = 'th', height }) => {
  const classes = useStyles()

  return (
    <Component>
      <Box className={classes.container} height={height}>
        <Tooltip title={children}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100px"
          >
            <Box>
              <Box className={classes.heading}>
                <Typography component="span" className={classes.title}>
                  {children}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Tooltip>
      </Box>
    </Component>
  )
}

export default VerticalHeading
