import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, ButtonBase } from '@mui/material'
import { ChevronRight } from '@mui/icons-material'

const styles = {
  accordionButton: {
    width: '22rem',
    flexShrink: 0,
    minHeight: '48px',
    // maxHeight: '74px',
    paddingRight: '2.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    borderRadius: '10px',
    textAlign: 'left',
    textTransform: 'none',
    '&:hover': {
      background: theme => theme.palette.action.hover,
    },
    '&:active': {
      background: theme => theme.palette.action.selected,
    },
    transition: 'background-color 0.15s ease-out',
  },
  unclickableLabel: {
    width: '22rem',
    flexShrink: 0,
    minHeight: '48px',
    // maxHeight: '74px',
    paddingRight: '2.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    borderRadius: '10px',
    textAlign: 'left',
    textTransform: 'none',
  },
  link: {
    color: theme => theme.palette.primary.main,
  },
  arrowContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingRight: '0.7rem',
    '&:hover': {
      color: theme => theme.palette.text.primary,
    },
    color: theme => theme.palette.info.main,
  },
  arrow: {
    transition: 'transform 0.2s ease-out',
  },
  arrowOpen: {
    transform: 'rotate(90deg)',
  },
}

const RowHeader = ({ openable = false, isOpen = false, handleOpenRow, label, link }) => (
  // eslint-disable-next-line react/jsx-no-useless-fragment
  <>
    {openable ? (
      <ButtonBase onClick={handleOpenRow} sx={styles.accordionButton} variant="contained" disableRipple>
        {label}
        <Box sx={styles.arrowContainer}>
          <ChevronRight sx={{ ...styles.arrow, ...(isOpen ? styles.arrowOpen : {}) }} />
        </Box>
      </ButtonBase>
    ) : (
      // eslint-disable-next-line react/jsx-no-useless-fragment
      <>
        {link ? (
          <ButtonBase
            to={link}
            component={RouterLink}
            sx={{ ...styles.accordionButton, ...styles.link }}
            variant="contained"
          >
            {label}
          </ButtonBase>
        ) : (
          <Box sx={styles.unclickableLabel}>{label}</Box>
        )}
      </>
    )}
  </>
)

export default RowHeader
