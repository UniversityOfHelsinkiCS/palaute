import React from 'react'

import { Tooltip, Typography, Box, IconButton } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material'

const useStyles = makeStyles((theme) => ({
  heading: {
    position: 'absolute',
    display: 'flex',
    // Im not proud of this but it does its thing
    transform:
      'translateY(15px) translateX(-50%) translateX(-10px) rotate(-45deg) translateX(50%)',
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
  orderBySelection,
  setOrderBySelection,
  onOrderByChange,
}) => {
  const classes = useStyles()

  const handleOrderByChange = (isAscending) => {
    if (id === 0)
      onOrderByChange(`FEEDBACK_COUNT_${isAscending ? 'ASC' : 'DESC'}`)
    else if (id === 1)
      onOrderByChange(`FEEDBACK_RESPONSE_${isAscending ? 'ASC' : 'DESC'}`)
    else onOrderByChange(`QUESTION_MEAN_${id}_${isAscending ? 'ASC' : 'DESC'}`)

    setOrderBySelection([id, isAscending])
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
        {orderBySelection && (
          <OrderButton
            id={id}
            orderBySelection={orderBySelection}
            handleOrderByChange={handleOrderByChange}
          />
        )}
      </Box>
    </Component>
  )
}

const OrderButton = ({ id, orderBySelection, handleOrderByChange }) => {
  const [questionId, isAscending] = orderBySelection

  if (id === questionId) {
    return (
      <Box display="flex" justifyContent="center">
        <IconButton
          disableFocusRipple
          onClick={() => handleOrderByChange(!isAscending)}
          size="large"
        >
          <Icon isAscending={isAscending} />
        </IconButton>
      </Box>
    )
  }

  return (
    <Box display="flex" justifyContent="center">
      <IconButton onClick={() => handleOrderByChange(false)} size="large">
        <Icon disabled />
      </IconButton>
    </Box>
  )
}

const Icon = ({ disabled, isAscending }) => {
  const classes = useStyles()
  const style = {
    display: 'flex',
    flexDirection: 'column',
  }

  return (
    <div style={style}>
      <ArrowDropUp
        className={classes.icon}
        color={!disabled && !isAscending ? 'action' : 'disabled'}
      />
      <ArrowDropDown
        className={classes.icon}
        color={!disabled && isAscending ? 'action' : 'disabled'}
      />
    </div>
  )
}

export default VerticalHeading
