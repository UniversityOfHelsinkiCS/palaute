import React from 'react'

import {
  Tooltip,
  Typography,
  makeStyles,
  Box,
  IconButton,
} from '@material-ui/core'
import { ArrowDropUp, ArrowDropDown } from '@material-ui/icons'

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
  icon: {
    margin: '-8px',
  },
}))

const VerticalHeading = ({
  children,
  component: Component = 'th',
  height,
  id,
  index,
  active,
  setActive,
  onOrderByChange,
}) => {
  const classes = useStyles()
  const handleOrderByChange = (isAscending) => {
    if (id === 0) {
      onOrderByChange(`FEEDBACK_COUNT_${isAscending ? 'ASC' : 'DESC'}`)
    } else {
      onOrderByChange(`QUESTION_MEAN_${index}_${isAscending ? 'ASC' : 'DESC'}`)
    }
    setActive([index, isAscending])
  }

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
        {active && id !== 1 && (
          <OrderButton
            index={index}
            active={active}
            handleOrderByChange={handleOrderByChange}
          />
        )}
      </Box>
    </Component>
  )
}

const OrderButton = ({ index, active, handleOrderByChange }) => {
  const [activeIndex, ascending] = active

  if (index !== activeIndex) {
    return (
      <IconButton onClick={() => handleOrderByChange(false)}>
        <Icon disabled />
      </IconButton>
    )
  }

  return (
    <IconButton onClick={() => handleOrderByChange(!ascending)}>
      <Icon ascending={ascending} />
    </IconButton>
  )
}

const Icon = ({ disabled, ascending }) => {
  const classes = useStyles()
  const style = {
    display: 'flex',
    flexDirection: 'column',
  }

  return (
    <div style={style}>
      <ArrowDropUp
        className={classes.icon}
        color={!disabled && !ascending ? 'default' : 'disabled'}
      />
      <ArrowDropDown
        className={classes.icon}
        color={!disabled && ascending ? 'default' : 'disabled'}
      />
    </div>
  )
}

export default VerticalHeading
