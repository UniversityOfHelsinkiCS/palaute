import React from 'react'

export const tabProps = (index) => ({
  id: `tab-${index}`,
  'aria-controls': `tabpanel-${index}`,
  color: 'primary',
})

export const TabPanel = ({ children, ...props }) => {
  const { value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && children.length > 1
        ? children.map((c) => c)
        : children}
    </div>
  )
}
