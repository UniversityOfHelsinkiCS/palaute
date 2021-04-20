import React from 'react'
import { Tabs, Tab } from '@material-ui/core'

const tabOrder = ['fi', 'sv', 'en']

const LanguageTabs = ({ language, onChange, ...props }) => {
  const index = tabOrder.indexOf(language)
  const value = index < 0 ? 0 : index

  const handleChange = (event, newValue) => {
    onChange(tabOrder[newValue])
  }

  return (
    <Tabs
      indicatorColor="primary"
      textColor="primary"
      variant="scrollable"
      scrollButtons="auto"
      value={value}
      onChange={handleChange}
      {...props}
    >
      <Tab label="Finnish" />
      <Tab label="Swedish" />
      <Tab label="English" />
    </Tabs>
  )
}

export default LanguageTabs
