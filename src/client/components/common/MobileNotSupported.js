import React from 'react'
import { useTranslation } from 'react-i18next'
import ErrorView from './ErrorView'

const MobileNotSupported = () => {
  const { t } = useTranslation()
  return <ErrorView message={t('common:mobileNotSupported')} />
}

export default MobileNotSupported
