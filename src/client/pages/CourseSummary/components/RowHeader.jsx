import { ChevronRight } from '@mui/icons-material'
import { Box, ButtonBase } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

import { focusIndicatorStyle } from '../../../util/accessibility'

const styles = {
  accordionButton: {
    width: '23rem',
    flexShrink: 1,
    minWidth: 0,
    minHeight: '48px',
    marginRight: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    borderRadius: '10px',
    textAlign: 'left',
    textTransform: 'none',
    '&:hover': {
      background: theme => theme.palette.action.hover,
      '& .row-header-arrow': {
        color: theme => theme.palette.text.primary,
      },
    },
    '&:active': {
      background: theme => theme.palette.action.selected,
    },
    transition: 'background-color 0.15s ease-out',
    ...focusIndicatorStyle(),
  },
  unclickableLabel: {
    width: '23.5rem',
    flexShrink: 0,
    minHeight: '48px',
    paddingInline: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '10px',
  },
  link: {
    color: theme => theme.palette.primary.main,
  },
  arrow: {
    marginRight: '0.5rem',
    flexShrink: 0,
    color: theme => theme.palette.info.main,
    transition: 'transform 0.2s ease-out, color 0.15s ease-out',
  },
  arrowOpen: {
    transform: 'rotate(90deg)',
  },
}

const RowHeader = ({ openable = false, isOpen = false, handleOpenRow, label, link }) => (
  <>
    {openable ? (
      <ButtonBase onClick={handleOpenRow} sx={styles.accordionButton} variant="contained" disableRipple>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>{label}</Box>
        <ChevronRight className="row-header-arrow" sx={{ ...styles.arrow, ...(isOpen ? styles.arrowOpen : {}) }} />
      </ButtonBase>
    ) : (
      <>
        {link ? (
          <ButtonBase
            to={link}
            component={RouterLink}
            sx={{ ...styles.accordionButton, ...styles.link }}
            variant="contained"
          >
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>{label}</Box>
          </ButtonBase>
        ) : (
          <Box sx={styles.unclickableLabel}>{label}</Box>
        )}
      </>
    )}
  </>
)

export default RowHeader
