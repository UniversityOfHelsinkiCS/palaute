/** @jsxImportSource @emotion/react */
import { Tooltip } from '@mui/material'
import React from 'react'

import { getColor } from '../../util/resultColors'

const styles = {
  item: {
    textAlign: 'center',
    position: 'relative',
    color: 'black',
  },
}

const ResultItemBase = ({ children, sx, tooltipTitle = '', component: Component = 'td', mean, ...props }) => {
  const style = {
    ...(sx ?? {}),
    ...styles.item,
    backgroundColor: getColor(mean),
  }

  return (
    <Tooltip title={tooltipTitle}>
      <Component css={style} {...props}>
        {children}
      </Component>
    </Tooltip>
  )
}

export default ResultItemBase
