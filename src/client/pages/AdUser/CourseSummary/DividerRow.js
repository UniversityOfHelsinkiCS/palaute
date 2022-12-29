import React from 'react'
/** @jsxImportSource @emotion/react */

const DividerRow = ({ height = 0.4 }) => (
  <tr
    css={(theme) => ({
      display: 'block',
      height: theme.spacing(height),
    })}
  />
)

export default DividerRow
