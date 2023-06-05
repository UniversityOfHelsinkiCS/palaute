import React from 'react'
import { styled, Tooltip, tooltipClasses } from '@mui/material'

const PaperTooltip = styled(({ className, ...props }) => <Tooltip {...props} classes={{ popper: className }} />)(
  ({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.common.white,
      color: 'rgba(0, 0, 0, 0.87)',
      boxShadow: theme.shadows[5],
      fontSize: 11,
    },
  })
)

export default PaperTooltip
