import React from 'react'
import { Tabs, Tab } from '@material-ui/core'
import { useTranslation } from 'react-i18next'

const tabOrder = ['fi', 'sv', 'en']

const LanguageTabs = ({ language, onChange, ...props }) => {
  const { t } = useTranslation()
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
      <Tab label={t('languages.fi')} />
      <Tab label={t('languages.sv')} />
      <Tab label={t('languages.en')} />
    </Tabs>
  )
}

export default LanguageTabs
