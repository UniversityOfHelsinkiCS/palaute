import styled from '@mui/material/styles/styled'
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip'
import React from 'react'

const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 500,
  },
})

export default CustomWidthTooltip
