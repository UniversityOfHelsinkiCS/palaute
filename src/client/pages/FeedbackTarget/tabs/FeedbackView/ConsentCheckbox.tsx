import React from 'react'
import { useTranslation } from 'react-i18next'

import FormikCheckbox from '../../../../components/common/FormikCheckbox'

interface ConsentCheckboxProps {
  label: string
  dataCy: string
  handleChange: (field: string, value: boolean) => void
}

export const ConsentCheckbox = ({ label, dataCy, handleChange }: ConsentCheckboxProps) => {
  const { t } = useTranslation()

  return (
    <FormikCheckbox
      data-cy={dataCy}
      name="activateSubmit"
      label={label}
      onChange={({ target }: React.ChangeEvent<HTMLInputElement>) => {
        handleChange('activateSubmit', target.checked)
      }}
      ariaDescription={t('feedbackView:allowSubmitCheckboxAria')}
    />
  )
}
